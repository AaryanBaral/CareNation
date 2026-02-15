namespace backend.Models;

public class KhaltiPayment
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public User User { get; set; } = null!;
    public string Pidx { get; set; } = string.Empty;
    public string PurchaseOrderId { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Status { get; set; } = "Initiated";
    public string? PaymentUrl { get; set; }
    public int? OrderId { get; set; }
    public Order? Order { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }
    public string? RawResponse { get; set; }
}
