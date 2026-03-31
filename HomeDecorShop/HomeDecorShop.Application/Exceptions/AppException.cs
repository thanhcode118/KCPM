namespace HomeDecorShop.Application;

public abstract class AppException : Exception
{
    protected AppException(string message, int statusCode, string title, string? type = null)
        : base(message)
    {
        StatusCode = statusCode;
        Title = title;
        Type = type ?? $"https://httpstatuses.com/{statusCode}";
    }

    public int StatusCode { get; }

    public string Title { get; }

    public string Type { get; }
}
