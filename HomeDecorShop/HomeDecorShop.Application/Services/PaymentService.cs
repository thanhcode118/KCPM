using System.Transactions;
using HomeDecorShop.Domain;

namespace HomeDecorShop.Application;

public sealed class PaymentService(
    IPaymentRepository paymentRepository,
    IOrderRepository orderRepository,
    IUserRepository userRepository) : IPaymentService
{
    public IReadOnlyCollection<PaymentView> GetMine(string token)
    {
        var user = RequireUser(token);
        return paymentRepository.GetByUserId(user.UserId)
            .Select(MapPayment)
            .ToArray();
    }

    public IReadOnlyCollection<PaymentView> GetByOrderId(string token, int orderId)
    {
        var user = RequireUser(token);
        var order = orderRepository.GetById(orderId);
        if (order is null || order.UserId != user.UserId)
        {
            throw new NotFoundException($"Order with id {orderId} was not found.");
        }

        return paymentRepository.GetByOrderId(orderId)
            .Select(MapPayment)
            .ToArray();
    }

    public PaymentView? GetById(string token, int paymentId)
    {
        var user = RequireUser(token);
        var payment = paymentRepository.GetById(paymentId);
        return payment is null || payment.Order.UserId != user.UserId
            ? null
            : MapPayment(payment);
    }

    public PaymentView Process(string token, PaymentProcessInput input)
    {
        var user = RequireUser(token);
        var order = orderRepository.GetById(input.OrderId);
        if (order is null || order.UserId != user.UserId)
        {
            throw new NotFoundException($"Order with id {input.OrderId} was not found.");
        }

        if (order.Status == OrderStatus.Cancelled)
        {
            throw new ConflictException("Cancelled orders cannot be paid.");
        }

        if (order.PaymentStatus == PaymentStatus.Paid)
        {
            throw new ConflictException("This order has already been paid.");
        }

        if (order.Status != OrderStatus.PendingPayment)
        {
            throw new ConflictException("Only orders waiting for payment can be processed.");
        }

        var now = DateTime.UtcNow;
        var payment = new Payment
        {
            OrderId = order.Id,
            Method = input.Method.Trim().ToLowerInvariant(),
            Status = PaymentStatus.Paid,
            Amount = order.TotalAmount,
            TransactionCode = $"PAY-{now:yyyyMMddHHmmssfff}-{order.Id}",
            PaidAt = now,
            CreatedAt = now,
            UpdatedAt = now
        };

        using var scope = CreateTransactionScope();

        var created = paymentRepository.Create(payment);
        order.PaymentStatus = PaymentStatus.Paid;
        order.Status = OrderStatus.Processing;
        order.UpdatedAt = now;
        _ = orderRepository.Update(order);

        scope.Complete();
        return MapPayment(created);
    }

    private User RequireUser(string token) =>
        userRepository.GetByToken(token.Trim())
        ?? throw new UnauthorizedException("Authentication token is invalid or has expired.");

    private static PaymentView MapPayment(Payment payment) =>
        new(
            payment.Id,
            payment.OrderId,
            payment.Order.OrderNumber,
            payment.Method,
            ToSnakeCase(payment.Status),
            payment.Amount,
            payment.TransactionCode,
            payment.PaidAt,
            payment.CreatedAt,
            payment.UpdatedAt);

    private static string ToSnakeCase<TEnum>(TEnum value) where TEnum : struct, Enum =>
        string.Concat(
            value.ToString()
                .Select((character, index) =>
                    index > 0 && char.IsUpper(character)
                        ? $"_{char.ToLowerInvariant(character)}"
                        : char.ToLowerInvariant(character).ToString()));

    private static TransactionScope CreateTransactionScope() =>
        new(TransactionScopeOption.Required, TransactionScopeAsyncFlowOption.Enabled);
}
