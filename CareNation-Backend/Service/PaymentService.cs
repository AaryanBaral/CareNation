using backend.Data;
using backend.Dto;
using backend.Interface.Repository;
using backend.Interface.Service;
using backend.Mapper;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Service;

public class PaymentService : IPaymentService
{
    private readonly AppDbContext _context;
    private readonly IPaymentRepository _paymentRepository;
    private readonly IFileStorageService _fileStorageService;

    public PaymentService(
        AppDbContext context,
        IPaymentRepository paymentRepository,
        IFileStorageService fileStorageService)
    {
        _context = context;
        _paymentRepository = paymentRepository;
        _fileStorageService = fileStorageService;
    }

    public async Task<PaymentReadDto> RecordWithdrawalPaymentAsync(
        int withdrawalId,
        string adminUserId,
        WithdrawalPaymentRequestDto request)
    {
        var withdrawal = await _context.WithdrawalRequests
            .Include(w => w.User)
            .Include(w => w.Payment)
            .FirstOrDefaultAsync(w => w.Id == withdrawalId);

        if (withdrawal == null)
            throw new KeyNotFoundException("Withdrawal request not found.");

        if (!string.Equals(withdrawal.Status, "Pending", StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException("Only pending withdrawals can be paid.");

        if (withdrawal.Payment != null)
            throw new InvalidOperationException("This withdrawal already has a recorded payment.");

        var distributor = withdrawal.User;
        var amount = request.Amount ?? withdrawal.Amount;
        if (amount != withdrawal.Amount)
            throw new InvalidOperationException("Payment amount must match the requested withdrawal amount.");

        if (distributor.TotalWallet < amount)
            throw new InvalidOperationException("Distributor wallet has insufficient balance for this withdrawal.");

        if (request.Proof == null)
            throw new ArgumentException("Payment proof image is required.");

        var proofUrl = await _fileStorageService.UploadAsync(request.Proof, "payments");

        var payment = new Payment
        {
            PaymentType = PaymentType.Withdrawal,
            Status = PaymentStatus.Completed,
            Amount = amount,
            CreatedAt = DateTime.UtcNow,
            PaidAt = DateTime.UtcNow,
            Notes = request.Remarks,
            ReferenceNumber = request.ReferenceNumber,
            ProofImageUrl = proofUrl,
            PaidByUserId = adminUserId,
            PaidToUserId = withdrawal.UserId,
            WithdrawalRequestId = withdrawal.Id
        };

        distributor.TotalWallet -= amount;
        withdrawal.Status = "Paid";
        withdrawal.ProcessedDate = DateTime.UtcNow;
        withdrawal.Remarks = string.IsNullOrWhiteSpace(request.Remarks)
            ? withdrawal.Remarks
            : request.Remarks;
        withdrawal.PaymentProofUrl = proofUrl;

        _context.Payments.Add(payment);
        await _context.SaveChangesAsync();

        var persisted = await _paymentRepository.GetByIdAsync(payment.Id)
            ?? payment;

        return persisted.ToDto();
    }

    public async Task<IEnumerable<PaymentReadDto>> GetPaymentsAsync(PaymentType? type, DateTime? from, DateTime? to)
    {
        var payments = await _paymentRepository.GetPaymentsAsync(type, from, to);
        return payments.Select(p => p.ToDto());
    }

    public async Task<IEnumerable<PaymentReadDto>> GetPaymentsForUserAsync(string userId, PaymentType? type, DateTime? from, DateTime? to)
    {
        var payments = await _paymentRepository.GetPaymentsAsync(type, from, to, userId);
        return payments.Select(p => p.ToDto());
    }

    public async Task<PaymentReadDto> UpdateWithdrawalPaymentProofAsync(
        int withdrawalId,
        string adminUserId,
        WithdrawalPaymentProofUpdateDto request)
    {
        if (request.Proof == null)
            throw new ArgumentException("Proof image is required.");

        var withdrawal = await _context.WithdrawalRequests
            .Include(w => w.Payment)
            .FirstOrDefaultAsync(w => w.Id == withdrawalId);

        if (withdrawal == null)
            throw new KeyNotFoundException("Withdrawal request not found.");

        if (withdrawal.Payment == null)
            throw new InvalidOperationException("No payment has been recorded for this withdrawal yet.");

        var payment = withdrawal.Payment;

        var newProofUrl = await _fileStorageService.UploadAsync(request.Proof, "payments");

        if (!string.IsNullOrWhiteSpace(payment.ProofImageUrl))
        {
            await _fileStorageService.DeleteByUrlAsync(payment.ProofImageUrl);
        }

        payment.ProofImageUrl = newProofUrl;
        if (!string.IsNullOrWhiteSpace(request.ReferenceNumber))
            payment.ReferenceNumber = request.ReferenceNumber;

        if (!string.IsNullOrWhiteSpace(request.Remarks))
            payment.Notes = request.Remarks;

        payment.PaidByUserId ??= adminUserId;
        withdrawal.PaymentProofUrl = newProofUrl;
        if (!string.IsNullOrWhiteSpace(request.Remarks))
            withdrawal.Remarks = request.Remarks;

        await _context.SaveChangesAsync();

        var persisted = await _paymentRepository.GetByIdAsync(payment.Id) ?? payment;
        return persisted.ToDto();
    }
}
