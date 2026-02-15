namespace backend.Dto;

public class KhaltiInitRequestDto
{
    public string? ReturnUrl { get; set; }
}

public class KhaltiInitResponseDto
{
    public string Pidx { get; set; } = string.Empty;
    public string PaymentUrl { get; set; } = string.Empty;
    public decimal Amount { get; set; }
}

public class KhaltiVerifyRequestDto
{
    public string Pidx { get; set; } = string.Empty;
}

public class KhaltiVerifyResponseDto
{
    public int OrderId { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Pidx { get; set; }
    public decimal Amount { get; set; }
    public string? PurchaseOrderId { get; set; }
    public DateTime PaidOn { get; set; }
    public OrderReadDto? Order { get; set; }
}
