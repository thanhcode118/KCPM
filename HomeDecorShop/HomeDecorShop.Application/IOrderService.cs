namespace HomeDecorShop.Application;

public interface IOrderService
{
    IReadOnlyCollection<OrderView> GetMine(string token);
    OrderView? GetById(string token, int orderId);
    OrderView PlaceOrder(string token, PlaceOrderInput input);
    OrderView? Cancel(string token, int orderId);
}
