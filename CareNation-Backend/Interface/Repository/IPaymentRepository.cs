using backend.Models;

namespace backend.Interface.Repository;

public interface IPaymentRepository
{
    Task<Payment?> GetByIdAsync(int id);
    Task<Payment?> GetByWithdrawalRequestIdAsync(int withdrawalRequestId);
    Task AddAsync(Payment payment);
    Task<List<Payment>> GetPaymentsAsync(
        PaymentType? type,
        DateTime? from,
        DateTime? to,
        string? paidToUserId = null);
}
