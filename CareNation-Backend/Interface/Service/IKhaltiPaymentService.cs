using backend.Dto;

namespace backend.Interface.Service;

public interface IKhaltiPaymentService
{
    Task<KhaltiInitResponseDto> InitiatePaymentAsync(string userId, string? returnUrl);
    Task<KhaltiVerifyResponseDto> VerifyPaymentAsync(string userId, string pidx);
}
