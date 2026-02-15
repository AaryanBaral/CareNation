using System.Linq;
using backend.Dto;
using backend.Models;

namespace backend.Mapper;

public static class PaymentMapper
{
    public static PaymentReadDto ToDto(this Payment payment)
    {
        return new PaymentReadDto
        {
            Id = payment.Id,
            PaymentType = payment.PaymentType.ToString(),
            Status = payment.Status.ToString(),
            Amount = payment.Amount,
            CreatedAt = payment.CreatedAt,
            PaidAt = payment.PaidAt,
            Notes = payment.Notes,
            ReferenceNumber = payment.ReferenceNumber,
            ProofImageUrl = payment.ProofImageUrl,
            PaidByUserId = payment.PaidByUserId,
            PaidByName = BuildUserName(payment.PaidByUser),
            PaidToUserId = payment.PaidToUserId,
            PaidToName = BuildUserName(payment.PaidToUser),
            OrderId = payment.OrderId,
            WithdrawalRequestId = payment.WithdrawalRequestId
        };
    }

    private static string? BuildUserName(User? user)
    {
        if (user == null) return null;
        var parts = new[] { user.FirstName, user.MiddleName, user.LastName }
            .Where(p => !string.IsNullOrWhiteSpace(p))
            .Select(p => p!.Trim());
        return string.Join(" ", parts);
    }
}
