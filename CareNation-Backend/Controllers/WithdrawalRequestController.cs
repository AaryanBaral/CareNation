using System.Security.Claims;
using backend.Dto;
using backend.Interface.Service;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [Authorize(Policy = "SensitiveAction")]
    [Authorize(AuthenticationSchemes = "Bearer")]
    [ApiController]
    [Route("api/withdrawals")]
    public class WithdrawalRequestController : ControllerBase
    {
        private readonly IWithdrawalRequestService _service;
        private readonly IPaymentService _paymentService;

        public WithdrawalRequestController(IWithdrawalRequestService service, IPaymentService paymentService)
        {
            _service = service;
            _paymentService = paymentService;
        }

        [HttpGet]
        public async Task<ActionResult<List<WithdrawalRequestDto>>> GetAll()
        {
            var data = await _service.GetAllAsync();
            return Ok(data);
        }

        [HttpGet("search")]
        public async Task<ActionResult<List<WithdrawalRequestDto>>> Search(string keyword)
        {
            var data = await _service.SearchAsync(keyword);
            return Ok(data);
        }

        [HttpPost("request")]
        public async Task<ActionResult<WithdrawalRequestDto>> RequestWithdrawal([FromBody] WithdrawalRequestCreateDto dto)
        {
        string userId = (User.FindFirstValue(ClaimTypes.NameIdentifier)) ?? throw new UnauthorizedAccessException("Please login to view this");
            var data = await _service.CreateAsync(userId!, dto.Amount, dto.Remarks);
            return Ok(data);
        }

        [HttpPut("{id}/approve")]
        public async Task<ActionResult<PaymentReadDto>> Approve(int id, [FromForm] WithdrawalPaymentRequestDto request)
        {
            var adminUserId = (User.FindFirstValue(ClaimTypes.NameIdentifier)) ?? throw new UnauthorizedAccessException("Please login to approve withdrawals.");
            var payment = await _paymentService.RecordWithdrawalPaymentAsync(id, adminUserId, request);
            return Ok(payment);
        }

        [HttpPut("{id}/reject")]
        public async Task<ActionResult> Reject(int id, [FromBody] string remarks = "")
        {
            var result = await _service.RejectAsync(id, remarks);
            return result ? Ok("Rejected") : BadRequest("Unable to reject.");
        }

        [HttpPut("{id}/payment-proof")]
        public async Task<ActionResult<PaymentReadDto>> UpdatePaymentProof(int id, [FromForm] WithdrawalPaymentProofUpdateDto request)
        {
            var adminUserId = (User.FindFirstValue(ClaimTypes.NameIdentifier)) ?? throw new UnauthorizedAccessException("Please login to update payment proofs.");
            var payment = await _paymentService.UpdateWithdrawalPaymentProofAsync(id, adminUserId, request);
            return Ok(payment);
        }
    }

    public class WithdrawalRequestCreateDto
    {
        public decimal Amount { get; set; }
        public string? Remarks { get; set; }
    }
}
