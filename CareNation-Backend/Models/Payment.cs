namespace backend.Models;

public enum PaymentType
{
    Order = 1,
    Withdrawal = 2
}

public enum PaymentStatus
{
    Pending = 1,
    Completed = 2,
    Failed = 3
}

public class Payment
{
    public int Id { get; set; }
    public PaymentType PaymentType { get; set; }
    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;
    public decimal Amount { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? PaidAt { get; set; }
    public string? Notes { get; set; }
    public string? ReferenceNumber { get; set; }
    public string? ProofImageUrl { get; set; }
    public string? PaidByUserId { get; set; }
    public User? PaidByUser { get; set; }
    public string? PaidToUserId { get; set; }
    public User? PaidToUser { get; set; }
    public int? OrderId { get; set; }
    public Order? Order { get; set; }
    public int? WithdrawalRequestId { get; set; }
    public WithdrawalRequest? WithdrawalRequest { get; set; }
    public bool IsDeleted { get; set; }
}
