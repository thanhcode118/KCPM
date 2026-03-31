namespace HomeDecorShop.Application;

public sealed class ConflictException : AppException
{
    public ConflictException(string message)
        : base(message, 409, "Conflict")
    {
    }
}
