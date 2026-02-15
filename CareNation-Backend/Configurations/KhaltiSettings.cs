namespace backend.Configurations;

public class KhaltiSettings
{
    public string BaseUrl { get; set; } = "";
    public string SecretKey { get; set; } = "";
    public string? WebsiteUrl { get; set; }
    public string? DefaultReturnUrl { get; set; }
}
