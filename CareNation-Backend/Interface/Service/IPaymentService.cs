using backend.Dto;
using backend.Models;

namespace backend.Interface.Service;

public interface IPaymentService
{
    Task<PaymentReadDto> RecordWithdrawalPaymentAsync(int withdrawalId, string adminUserId, WithdrawalPaymentRequestDto request);
    Task<IEnumerable<PaymentReadDto>> GetPaymentsAsync(PaymentType? type, DateTime? from, DateTime? to);
    Task<IEnumerable<PaymentReadDto>> GetPaymentsForUserAsync(string userId, PaymentType? type, DateTime? from, DateTime? to);
    Task<PaymentReadDto> UpdateWithdrawalPaymentProofAsync(int withdrawalId, string adminUserId, WithdrawalPaymentProofUpdateDto request);
}
