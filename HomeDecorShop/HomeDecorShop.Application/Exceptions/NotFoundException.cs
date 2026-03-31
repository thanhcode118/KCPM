namespace HomeDecorShop.Application;

public sealed class NotFoundException : AppException
{
    public NotFoundException(string message)
        : base(message, 404, "Resource not found")
    {
    }
}
