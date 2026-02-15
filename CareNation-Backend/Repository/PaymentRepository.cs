using backend.Data;
using backend.Interface.Repository;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Repository;

public class PaymentRepository : IPaymentRepository
{
    private readonly AppDbContext _context;

    public PaymentRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Payment?> GetByIdAsync(int id)
    {
        return await _context.Payments
            .Include(p => p.PaidByUser)
            .Include(p => p.PaidToUser)
            .Include(p => p.Order)
            .Include(p => p.WithdrawalRequest)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<Payment?> GetByWithdrawalRequestIdAsync(int withdrawalRequestId)
    {
        return await _context.Payments
            .Include(p => p.PaidByUser)
            .Include(p => p.PaidToUser)
            .FirstOrDefaultAsync(p => p.WithdrawalRequestId == withdrawalRequestId);
    }

    public async Task AddAsync(Payment payment)
    {
        _context.Payments.Add(payment);
        await _context.SaveChangesAsync();
    }

    public async Task<List<Payment>> GetPaymentsAsync(
        PaymentType? type,
        DateTime? from,
        DateTime? to,
        string? paidToUserId = null)
    {
        var query = _context.Payments
            .Include(p => p.PaidByUser)
            .Include(p => p.PaidToUser)
            .AsQueryable();

        if (type.HasValue)
            query = query.Where(p => p.PaymentType == type.Value);

        if (from.HasValue)
            query = query.Where(p => p.CreatedAt >= from.Value);

        if (to.HasValue)
            query = query.Where(p => p.CreatedAt <= to.Value);

        if (!string.IsNullOrEmpty(paidToUserId))
            query = query.Where(p => p.PaidToUserId == paidToUserId);

        return await query
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
    }
}
