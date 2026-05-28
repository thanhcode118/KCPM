using Xunit;
using Moq;
using HomeDecorShop.Domain;
using HomeDecorShop.Application;

namespace HomeDecorShop.Tests.Services
{
    public class OrderServiceTests
    {
        private readonly Mock<IOrderRepository> _orderRepoMock;
        private readonly Mock<ICartRepository> _cartRepoMock;
        private readonly Mock<IUserRepository> _userRepoMock;
        private readonly Mock<IProductRepository> _productRepoMock;
        private readonly Mock<IPaymentRepository> _paymentRepoMock;
        private readonly Mock<IWalletService> _walletServiceMock;
        
        private readonly OrderService _orderService;
        private const string Token = "valid_test_token";

        public OrderServiceTests()
        {
            _orderRepoMock = new Mock<IOrderRepository>();
            _cartRepoMock = new Mock<ICartRepository>();
            _userRepoMock = new Mock<IUserRepository>();
            _productRepoMock = new Mock<IProductRepository>();
            _paymentRepoMock = new Mock<IPaymentRepository>();
            _walletServiceMock = new Mock<IWalletService>();

            _orderService = new OrderService(
                _orderRepoMock.Object,
                _cartRepoMock.Object,
                _userRepoMock.Object,
                _productRepoMock.Object,
                _paymentRepoMock.Object,
                _walletServiceMock.Object
            );
        }

        #region 1. TEST CASES FOR PLACE ORDER

        [Fact]
        public void PlaceOrder_Success_ShouldCalculateCorrectAmounts_DecreaseStock_AndClearCart()
        {
            // Arrange
            var user = new User { UserId = 1, Role = UserRole.Customer };
            var product = new Product { ProductId = 10, Price = 100000m, StockLeft = 5, IsActive = true, Sku = "SKU01", ProductName = "Product 01" };
            
            var cart = new Cart
            {
                UserId = user.UserId,
                Items = new List<CartItem> 
                { 
                    new() { Id = 1, ProductId = 10, Quantity = 2, UnitPrice = 100000m } 
                }
            };
            
            var input = new PlaceOrderInput 
            { 
                FullName = "Nguyen Van A", Phone = "0123456789", 
                Line1 = "123 Street", Ward = "Ward 1", District = "District 1", City = "HCM" 
            };

            _userRepoMock.Setup(x => x.GetByToken(Token)).Returns(user);
            _cartRepoMock.Setup(x => x.GetByUserId(user.UserId)).Returns(cart);
            _productRepositoryMock_SetupGetById(product);
            
            _orderRepoMock.Setup(x => x.Create(It.IsAny<Order>())).Returns<Order>(o => o);

            // Act
            var result = _orderService.PlaceOrder(Token, input);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(200000m, result.Subtotal); // 100k * 2
            Assert.Equal(30000m, result.ShippingFee); // Phí ship cố định
            Assert.Equal(230000m, result.TotalAmount); // Subtotal + Ship

            // Kiểm tra giảm tồn kho (Ban đầu có 5, mua 2 còn 3)
            Assert.Equal(3, product.StockLeft);
            _productRepoMock.Verify(x => x.Update(product), Times.Once);

            // Kiểm tra giỏ hàng bị xóa sạch sau khi đặt thành công
            Assert.Empty(cart.Items);
            _cartRepoMock.Verify(x => x.Update(cart), Times.Once);
        }

        [Fact]
        public void PlaceOrder_EmptyCart_ShouldThrowRequestValidationException()
        {
            // Arrange
            var user = new User { UserId = 1 };
            var cart = new Cart { UserId = user.UserId, Items = new List<CartItem>() }; // Giỏ rỗng
            var input = new PlaceOrderInput();

            _userRepoMock.Setup(x => x.GetByToken(Token)).Returns(user);
            _cartRepoMock.Setup(x => x.GetByUserId(user.UserId)).Returns(cart);

            // Act & Assert
            Assert.Throws<RequestValidationException>(() => _orderService.PlaceOrder(Token, input));
        }

        [Fact]
        public void PlaceOrder_ProductOutOfStock_ShouldThrowConflictException()
        {
            // Arrange
            var user = new User { UserId = 1 };
            var product = new Product { ProductId = 10, Price = 50000m, StockLeft = 1, IsActive = true }; // Chỉ còn 1 sản phẩm
            var cart = new Cart
            {
                UserId = user.UserId,
                Items = new List<CartItem> { new() { ProductId = 10, Quantity = 2 } } // Đặt mua tận 2
            };
            var input = new PlaceOrderInput { FullName = "A", Phone = "01", Line1 = "L", Ward = "W", District = "D", City = "C" };

            _userRepoMock.Setup(x => x.GetByToken(Token)).Returns(user);
            _cartRepoMock.Setup(x => x.GetByUserId(user.UserId)).Returns(cart);
            _productRepositoryMock_SetupGetById(product);

            // Act & Assert
            Assert.Throws<ConflictException>(() => _orderService.PlaceOrder(Token, input));
        }

        #endregion

        #region 2. TEST CASES FOR CANCEL ORDER

        [Fact]
        public void Cancel_Success_ShouldRestoreStock_AndUpdateStatusToCancelled()
        {
            // Arrange
            var user = new User { UserId = 1 };
            var product = new Product { ProductId = 5, StockLeft = 10 };
            var order = new Order
            {
                Id = 100, UserId = user.UserId, Status = OrderStatus.PendingPayment,
                Items = new List<OrderItem> { new() { ProductId = 5, Quantity = 3 } }
            };

            _userRepoMock.Setup(x => x.GetByToken(Token)).Returns(user);
            _orderRepoMock.Setup(x => x.GetById(order.Id)).Returns(order);
            _productRepositoryMock_SetupGetById(product);
            _paymentRepoMock.Setup(x => x.GetByOrderId(order.Id)).Returns(new List<Payment>()); // Không có giao dịch chờ
            _orderRepoMock.Setup(x => x.Update(It.IsAny<Order>())).Returns<Order>(o => o);

            // Act
            var result = _orderService.Cancel(Token, order.Id);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(13, product.StockLeft); // 10 + 3 trả lại kho
            Assert.Equal("cancelled", result.Status); // Kiểm tra map snake_case thành công
            _productRepoMock.Verify(x => x.Update(product), Times.Once);
        }

        [Fact]
        public void Cancel_OrderHasPendingVNPayPayment_ShouldThrowConflictException()
        {
            // Arrange
            var user = new User { UserId = 1 };
            var order = new Order { Id = 100, UserId = user.UserId, Status = OrderStatus.PendingPayment };
            
            // Giả lập giao dịch VNPay đang Pending
            var payments = new List<Payment> 
            { 
                new() { Method = "vnpay", Status = PaymentStatus.Pending } 
            };

            _userRepoMock.Setup(x => x.GetByToken(Token)).Returns(user);
            _orderRepoMock.Setup(x => x.GetById(order.Id)).Returns(order);
            _paymentRepoMock.Setup(x => x.GetByOrderId(order.Id)).Returns(payments);

            // Act & Assert
            Assert.Throws<ConflictException>(() => _orderService.Cancel(Token, order.Id));
        }

        #endregion

        #region 3. TEST CASES FOR REFUND

        [Fact]
        public void RequestRefund_PaidOrder_ShouldChangeStatusToRefundRequested()
        {
            // Arrange
            var user = new User { UserId = 1 };
            var order = new Order { Id = 200, UserId = user.UserId, PaymentStatus = PaymentStatus.Paid, Status = OrderStatus.Completed };

            _userRepoMock.Setup(x => x.GetByToken(Token)).Returns(user);
            _orderRepoMock.Setup(x => x.GetById(order.Id)).Returns(order);
            _orderRepoMock.Setup(x => x.Update(It.IsAny<Order>())).Returns<Order>(o => o);

            // Act
            var result = _orderService.RequestRefund(Token, order.Id, "Sản phẩm lỗi");

            // Assert
            Assert.NotNull(result);
            Assert.Equal("refund_requested", result.Status);
            Assert.Contains("[KHIẾU NẠI]: Sản phẩm lỗi", order.Notes);
        }

        [Fact]
        public void RequestRefund_UnpaidOrder_ShouldThrowConflictException()
        {
            // Arrange
            var user = new User { UserId = 1 };
            var order = new Order { Id = 200, UserId = user.UserId, PaymentStatus = PaymentStatus.Pending }; // Chưa thanh toán

            _userRepoMock.Setup(x => x.GetByToken(Token)).Returns(user);
            _orderRepoMock.Setup(x => x.GetById(order.Id)).Returns(order);

            // Act & Assert
            Assert.Throws<ConflictException>(() => _orderService.RequestRefund(Token, order.Id, "Lý do"));
        }

        [Fact]
        public void ProcessRefund_ApproveByAdmin_ShouldCallWalletService_AndSetStatusToRefunded()
        {
            // Arrange
            var adminUser = new User { UserId = 2, Role = UserRole.Admin }; // Phải là Admin
            var order = new Order 
            { 
                Id = 300, UserId = 1, Status = OrderStatus.RefundRequested, 
                TotalAmount = 500000m, OrderNumber = "ORD-TEST-123" 
            };

            _userRepoMock.Setup(x => x.GetByToken(Token)).Returns(adminUser);
            _orderRepoMock.Setup(x => x.GetById(order.Id)).Returns(order);
            _orderRepoMock.Setup(x => x.Update(It.IsAny<Order>())).Returns<Order>(o => o);

            // Act
            var result = _orderService.ProcessRefund(Token, order.Id, approve: true);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("refunded", result.Status);
            Assert.Equal(PaymentStatus.Refunded, order.PaymentStatus);
            
            // Xác minh WalletService được kích hoạt chính xác để hoàn tiền cho Customer
            _walletServiceMock.Verify(x => x.ProcessRefundPayment(order.UserId, order.TotalAmount, order.OrderNumber), Times.Once);
        }

        [Fact]
        public void ProcessRefund_RejectByAdmin_ShouldSetStatusBackToCompleted()
        {
            // Arrange
            var adminUser = new User { UserId = 2, Role = UserRole.Admin };
            var order = new Order { Id = 300, UserId = 1, Status = OrderStatus.RefundRequested };

            _userRepoMock.Setup(x => x.GetByToken(Token)).Returns(adminUser);
            _orderRepoMock.Setup(x => x.GetById(order.Id)).Returns(order);
            _orderRepoMock.Setup(x => x.Update(It.IsAny<Order>())).Returns<Order>(o => o);

            // Act
            var result = _orderService.ProcessRefund(Token, order.Id, approve: false); // Từ chối duyệt

            // Assert
            Assert.NotNull(result);
            Assert.Equal("completed", result.Status); // Trả về Completed
            _walletServiceMock.Verify(x => x.ProcessRefundPayment(It.IsAny<int>(), It.IsAny<decimal>(), It.IsAny<string>()), Times.Never);
        }

        #endregion

        // Hàm helper phục vụ lấy ID sản phẩm linh hoạt
        private void _productRepositoryMock_SetupGetById(Product product)
        {
            _productRepoMock.Setup(x => x.GetById(product.ProductId)).Returns(product);
        }
    }
}