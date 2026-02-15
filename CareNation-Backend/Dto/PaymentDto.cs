using backend.Models;
using Microsoft.AspNetCore.Http;

namespace backend.Dto;

public class PaymentReadDto
{
    public int Id { get; set; }
    public string PaymentType { get; set; } = "";
    public string Status { get; set; } = "";
    public decimal Amount { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? PaidAt { get; set; }
    public string? Notes { get; set; }
    public string? ReferenceNumber { get; set; }
    public string? ProofImageUrl { get; set; }
    public string? PaidByUserId { get; set; }
    public string? PaidByName { get; set; }
    public string? PaidToUserId { get; set; }
    public string? PaidToName { get; set; }
    public int? OrderId { get; set; }
    public int? WithdrawalRequestId { get; set; }
}

public class PaymentCreateDto
{
    public PaymentType PaymentType { get; set; }
    public decimal Amount { get; set; }
    public int? OrderId { get; set; }
    public int? WithdrawalRequestId { get; set; }
    public string? Notes { get; set; }
    public string? ReferenceNumber { get; set; }
}

public class WithdrawalPaymentRequestDto
{
    public decimal? Amount { get; set; }
    public string? ReferenceNumber { get; set; }
    public string? Remarks { get; set; }
    public IFormFile? Proof { get; set; }
}

public class WithdrawalPaymentProofUpdateDto
{
    public IFormFile Proof { get; set; } = null!;
    public string? ReferenceNumber { get; set; }
    public string? Remarks { get; set; }
}
