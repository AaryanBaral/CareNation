using System.Security.Claims;
using backend.Dto;
using backend.Interface.Service;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[Authorize(AuthenticationSchemes = "Bearer")]
[ApiController]
[Route("api/payments")]
public class PaymentsController : ControllerBase
{
    private readonly IKhaltiPaymentService _khaltiPaymentService;

    public PaymentsController(IKhaltiPaymentService khaltiPaymentService)
    {
        _khaltiPaymentService = khaltiPaymentService;
    }

    [HttpPost("khalti/initiate")]
    public async Task<ActionResult<SuccessResponseDto<KhaltiInitResponseDto>>> InitiateKhalti([FromBody] KhaltiInitRequestDto request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? throw new UnauthorizedAccessException("Please login to make a payment.");

        var result = await _khaltiPaymentService.InitiatePaymentAsync(userId, request.ReturnUrl);
        return Ok(new SuccessResponseDto<KhaltiInitResponseDto> { Data = result });
    }

    [HttpPost("khalti/verify")]
    public async Task<ActionResult<SuccessResponseDto<KhaltiVerifyResponseDto>>> VerifyKhalti([FromBody] KhaltiVerifyRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Pidx))
            throw new ArgumentException("Payment reference (pidx) is required.");

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? throw new UnauthorizedAccessException("Please login to verify payment.");

        var result = await _khaltiPaymentService.VerifyPaymentAsync(userId, request.Pidx);
        return Ok(new SuccessResponseDto<KhaltiVerifyResponseDto> { Data = result });
    }
}
