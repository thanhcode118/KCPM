using HomeDecorShop.Domain;

namespace HomeDecorShop.Application;

public interface IOrderRepository
{
    IReadOnlyCollection<Order> GetByUserId(int userId);
    Order? GetById(int orderId);
    Order Create(Order order);
    Order Update(Order order);
}
