using backend.Dto;
using backend.Interface.Service;
using backend.Data;
using Microsoft.EntityFrameworkCore;
using backend.Interface.Repository;
using backend.Models;

namespace backend.Service;

public class CartService : ICartService
{
    private readonly ICartRepository _repo;
    private readonly AppDbContext _context; // inject this for product check,
    private readonly IProductImageRepository _productImageRepository;

    public CartService(ICartRepository repo, AppDbContext context, IProductImageRepository productImageRepository)
    {
        _repo = repo;
        _context = context;
        _productImageRepository = productImageRepository;
    }

    public async Task<CartReadDto> GetUserCartAsync(string userId)
    {
        var cart = await _repo.GetCartByUserIdAsync(userId);

        return new CartReadDto
        {
            Id = cart.Id,
            UserId = cart.UserId,
            Items = [.. await Task.WhenAll(cart.Items.Select(async i => {
                var imageUrls = await _productImageRepository.GetProductImagesByProductIdAsync(i.ProductId);
                    return new CartItemDetailsDto
                    {
                        ProductId = i.ProductId,
                        ProductName = i.Product.Title,
                        Price = i.Product.RetailPrice,
                        Quantity = i.Quantity,
                        ImageUrls = [.. imageUrls.Select(img => img.ImageUrl)],
                        AvailableStock = i.Product.StockQuantity
                    };
                }))]
            };

    }

    public async Task AddToCartAsync(string userId, CartItemDto itemDto)
    {
        if (itemDto.Quantity <= 0)
            throw new ArgumentException("Quantity must be greater than zero.");

        var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == itemDto.ProductId)
            ?? throw new ArgumentException("Product does not exist.");

        if (product.StockQuantity <= 0)
            throw new InvalidOperationException("Product is out of stock.");

        var cart = await _repo.GetCartByUserIdAsync(userId);
        var existingItem = cart.Items.FirstOrDefault(i => i.ProductId == itemDto.ProductId);
        var updatedQuantity = (existingItem?.Quantity ?? 0) + itemDto.Quantity;

        if (updatedQuantity > product.StockQuantity)
            throw new InvalidOperationException($"Only {product.StockQuantity} units available.");

        if (existingItem != null)
        {
            existingItem.Quantity = updatedQuantity;
        }
        else
        {
            cart.Items.Add(new CartItem
            {
                ProductId = itemDto.ProductId,
                Quantity = itemDto.Quantity
            });
        }

        await _context.SaveChangesAsync();
    }

    public async Task RemoveFromCartAsync(string userId, int productId)
    {
        await _repo.RemoveItemAsync(userId, productId);
    }

    public async Task ClearCartAsync(string userId)
    {
        await _repo.ClearCartAsync(userId);
    }
    public async Task UpdateItemQuantityAsync(string userId, int productId, int quantity)
    {
        var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == productId)
            ?? throw new ArgumentException("Product does not exist.");

        if (quantity > product.StockQuantity)
            throw new InvalidOperationException($"Only {product.StockQuantity} units available.");

        var cart = await _repo.GetCartByUserIdAsync(userId);
        var item = cart.Items.FirstOrDefault(i => i.ProductId == productId)
            ?? throw new InvalidOperationException("Item not found in cart.");

        if (quantity <= 0)
        {
            cart.Items.Remove(item);
        }
        else
        {
            item.Quantity = quantity;
        }

        await _context.SaveChangesAsync();
    }
}
