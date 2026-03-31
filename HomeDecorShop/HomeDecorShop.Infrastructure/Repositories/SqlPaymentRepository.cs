using HomeDecorShop.Application;
using HomeDecorShop.Domain;
using Microsoft.EntityFrameworkCore;

namespace HomeDecorShop.Infrastructure;

public sealed class SqlPaymentRepository(AppDbContext context) : IPaymentRepository
{
    public IReadOnlyCollection<Payment> GetByUserId(int userId)
    {
        return Query()
            .Where(payment => payment.Order.UserId == userId)
            .OrderByDescending(payment => payment.CreatedAt)
            .ToList();
    }

    public IReadOnlyCollection<Payment> GetByOrderId(int orderId)
    {
        return Query()
            .Where(payment => payment.OrderId == orderId)
            .OrderByDescending(payment => payment.CreatedAt)
            .ToList();
    }

    public Payment? GetById(int paymentId)
    {
        return Query()
            .FirstOrDefault(payment => payment.Id == paymentId);
    }

    public Payment Create(Payment payment)
    {
        context.Payments.Add(payment);
        context.SaveChanges();
        return GetById(payment.Id) ?? payment;
    }

    public Payment Update(Payment payment)
    {
        context.Payments.Update(payment);
        context.SaveChanges();
        return GetById(payment.Id) ?? payment;
    }

    private IQueryable<Payment> Query()
    {
        return context.Payments
            .Include(payment => payment.Order);
    }
}
