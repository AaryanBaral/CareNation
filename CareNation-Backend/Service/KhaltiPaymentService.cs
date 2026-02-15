using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using backend.Configurations;
using backend.Data;
using backend.Dto;

using backend.Interface.Service;
using backend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;


namespace backend.Service;

public class KhaltiPaymentService : IKhaltiPaymentService
{
    private readonly AppDbContext _context;
    private readonly ICartRepository _cartRepository;
    private readonly IOrderService _orderService;
    private readonly UserManager<User> _userManager;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly KhaltiSettings _settings;
    private readonly ILogger<KhaltiPaymentService> _logger;
    private static readonly JsonSerializerOptions _jsonOptions = new(JsonSerializerDefaults.Web)
    {
        PropertyNameCaseInsensitive = true
    };

    public KhaltiPaymentService(
        AppDbContext context,
        ICartRepository cartRepository,
        IOrderService orderService,
        UserManager<User> userManager,
        IHttpClientFactory httpClientFactory,
        IOptions<KhaltiSettings> options,
        ILogger<KhaltiPaymentService> logger)
    {
        _context = context;
        _cartRepository = cartRepository;
        _orderService = orderService;
        _userManager = userManager;
        _httpClientFactory = httpClientFactory;
        _settings = options.Value;
        _logger = logger;
    }

    public async Task<KhaltiInitResponseDto> InitiatePaymentAsync(string userId, string? returnUrl)
    {
        var cart = await _cartRepository.GetCartByUserIdAsync(userId);
        if (cart == null || cart.Items.Count == 0)
            throw new InvalidOperationException("Your cart is empty.");

        var amount = cart.Items.Sum(i => (i.Product?.RetailPrice ?? 0m) * i.Quantity);
        if (amount <= 0)
            throw new InvalidOperationException("Unable to calculate cart total.");

        var user = await _userManager.Users.FirstOrDefaultAsync(u => u.Id == userId)
            ?? throw new InvalidOperationException("User profile not found.");

        var purchaseOrderId = $"ORD-{DateTime.UtcNow:yyyyMMddHHmmssfff}-{Guid.NewGuid():N}".Substring(0, 28);
        var totalAmountInPaisa = Convert.ToInt32(Math.Round(amount * 100m, MidpointRounding.AwayFromZero));

        var payload = new
        {
            return_url = ResolveReturnUrl(returnUrl),
            website_url = ResolveWebsiteUrl(),
            amount = totalAmountInPaisa,
            purchase_order_id = purchaseOrderId,
            purchase_order_name = $"Order {purchaseOrderId}",
            customer_info = new
            {
                name = BuildCustomerName(user),
                email = user.Email ?? user.EmailAddress ?? "customer@khalti.com",
                phone = user.PhoneNumber ?? user.MobileNo ?? "9800000000"
            },
            product_details = cart.Items.Select(item =>
            {
                var unitPrice = item.Product?.RetailPrice ?? 0m;
                return new
                {
                    identity = item.ProductId.ToString(),
                    name = item.Product?.Title ?? "Cart item",
                    total_price = Convert.ToInt32(Math.Round(unitPrice * item.Quantity * 100m)),
                    quantity = item.Quantity,
                    unit_price = Convert.ToInt32(Math.Round(unitPrice * 100m))
                };
            }).ToList()
        };

        var response = await SendKhaltiRequestAsync("/api/v2/epayment/initiate/", payload);
        var initiate = await DeserializeAsync<KhaltiInitiateApiResponse>(response)
            ?? throw new InvalidOperationException("Invalid response from Khalti.");

        if (string.IsNullOrWhiteSpace(initiate.pidx) || string.IsNullOrWhiteSpace(initiate.payment_url))
            throw new InvalidOperationException("Khalti did not return a valid payment url.");

        var record = new KhaltiPayment
        {
            UserId = userId,
            Pidx = initiate.pidx,
            PurchaseOrderId = purchaseOrderId,
            Amount = amount,
            PaymentUrl = initiate.payment_url,
            Status = "Initiated"
        };

        _context.KhaltiPayments.Add(record);
        await _context.SaveChangesAsync();

        return new KhaltiInitResponseDto
        {
            Pidx = initiate.pidx,
            PaymentUrl = initiate.payment_url,
            Amount = amount
        };
    }

    public async Task<KhaltiVerifyResponseDto> VerifyPaymentAsync(string userId, string pidx)
    {
        if (string.IsNullOrWhiteSpace(pidx))
            throw new ArgumentException("Payment reference (pidx) is required.");

        var record = await _context.KhaltiPayments.FirstOrDefaultAsync(x => x.Pidx == pidx)
            ?? throw new KeyNotFoundException("Payment request not found.");

        if (!string.Equals(record.UserId, userId, StringComparison.Ordinal))
            throw new UnauthorizedAccessException("You are not allowed to verify this payment.");

        if (string.Equals(record.Status, "Completed", StringComparison.OrdinalIgnoreCase) && record.OrderId.HasValue)
        {
            var completedOrder = await _orderService.GetOrderByIdAsync(record.OrderId.Value);
            return new KhaltiVerifyResponseDto
            {
                OrderId = record.OrderId.Value,
                Status = record.Status,
                Pidx = record.Pidx,
                Amount = record.Amount,
                PurchaseOrderId = record.PurchaseOrderId,
                PaidOn = record.CompletedAt ?? DateTime.UtcNow,
                Order = completedOrder
            };
        }

        var lookup = await DeserializeAsync<KhaltiLookupResponse>(
            await SendKhaltiRequestAsync("/api/v2/epayment/lookup/", new { pidx }))
            ?? throw new InvalidOperationException("Unable to parse Khalti verification response.");

        if (!string.Equals(lookup.status, "Completed", StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException($"Payment is {lookup.status}. Please complete the transaction in Khalti.");

        var expected = Convert.ToInt32(Math.Round(record.Amount * 100m, MidpointRounding.AwayFromZero));
        if (lookup.total_amount != expected)
            throw new InvalidOperationException("Payment amount mismatch.");

        if (!string.IsNullOrWhiteSpace(lookup.purchase_order_id) &&
            !string.Equals(lookup.purchase_order_id, record.PurchaseOrderId, StringComparison.Ordinal))
        {
            _logger.LogWarning(
                "Khalti purchase order mismatch for pidx {Pidx}. Expected {Stored}, got {Received}. Continuing.",
                pidx,
                record.PurchaseOrderId,
                lookup.purchase_order_id);
            record.PurchaseOrderId = lookup.purchase_order_id!;
        }

        var orderId = record.OrderId;
        if (!orderId.HasValue)
        {
            orderId = await _orderService.PlaceOrderAsync(userId);
            record.OrderId = orderId;
        }

        var approved = await _orderService.ApproveOrderAsync(orderId.Value);
        if (!approved)
            throw new InvalidOperationException("Unable to approve order after successful payment.");

        record.Status = "Completed";
        record.CompletedAt = DateTime.UtcNow;
        record.RawResponse = JsonSerializer.Serialize(lookup, _jsonOptions);
        await _context.SaveChangesAsync();

        var orderDto = await _orderService.GetOrderByIdAsync(orderId.Value);

        return new KhaltiVerifyResponseDto
        {
            OrderId = orderId.Value,
            Status = record.Status,
            Pidx = record.Pidx,
            Amount = record.Amount,
            PurchaseOrderId = record.PurchaseOrderId,
            PaidOn = record.CompletedAt ?? DateTime.UtcNow,
            Order = orderDto
        };
    }

    private async Task<HttpResponseMessage> SendKhaltiRequestAsync(string path, object payload)
    {
        if (string.IsNullOrWhiteSpace(_settings.SecretKey))
            throw new InvalidOperationException("Khalti secret key is not configured.");

        var client = _httpClientFactory.CreateClient();
        var request = new HttpRequestMessage(HttpMethod.Post, $"{_settings.BaseUrl?.TrimEnd('/')}{path}");
        request.Headers.Authorization = new AuthenticationHeaderValue("Key", _settings.SecretKey);
        request.Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

        var response = await client.SendAsync(request);
        if (!response.IsSuccessStatusCode)
        {
            var errorMessage = await response.Content.ReadAsStringAsync();
            _logger.LogError("Khalti request to {Path} failed: {Error}", path, errorMessage);
            throw new InvalidOperationException("Payment gateway error. Please try again later.");
        }

        return response;
    }

    private static async Task<T?> DeserializeAsync<T>(HttpResponseMessage response)
    {
        await using var stream = await response.Content.ReadAsStreamAsync();
        return await JsonSerializer.DeserializeAsync<T>(stream, _jsonOptions);
    }

    private string ResolveReturnUrl(string? clientReturnUrl)
    {
        if (!string.IsNullOrWhiteSpace(clientReturnUrl))
            return clientReturnUrl;
        if (!string.IsNullOrWhiteSpace(_settings.DefaultReturnUrl))
            return _settings.DefaultReturnUrl!;
        return $"{ResolveWebsiteUrl().TrimEnd('/')}/checkout";
    }

    private string ResolveWebsiteUrl()
    {
        if (!string.IsNullOrWhiteSpace(_settings.WebsiteUrl))
            return _settings.WebsiteUrl!;
        return "http://localhost:5173";
    }

    private static string BuildCustomerName(User user)
    {
        var parts = new[] { user.FirstName, user.MiddleName, user.LastName }
            .Where(p => !string.IsNullOrWhiteSpace(p))
            .Select(p => p!.Trim());
        var full = string.Join(" ", parts);
        return string.IsNullOrWhiteSpace(full) ? user.UserName ?? "Customer" : full;
    }

    private sealed class KhaltiInitiateApiResponse
    {
        public string? pidx { get; set; }
        public string? payment_url { get; set; }
        public string? expires_at { get; set; }
    }

    private sealed class KhaltiLookupResponse
    {
        public string? status { get; set; }
        public string? purchase_order_id { get; set; }
        public int total_amount { get; set; }
    }
}
