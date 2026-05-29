using Xunit;
using Moq;
using HomeDecorShop.Domain;
using HomeDecorShop.Application;

namespace HomeDecorShop.Tests.Services
{
    public class DashboardServiceTests
    {
        private readonly Mock<IOrderRepository> _orderRepoMock;
        private readonly Mock<IUserRepository> _userRepoMock;
        private readonly DashboardService _dashboardService;
        private const string Token = "dashboard_test_token";

        public DashboardServiceTests()
        {
            _orderRepoMock = new Mock<IOrderRepository>();
            _userRepoMock = new Mock<IUserRepository>();

            _dashboardService = new DashboardService(
                _orderRepoMock.Object,
                _userRepoMock.Object
            );
        }

        #region 1. TEST CASES FOR SECURITY & PERMISSION

        [Fact]
        public void GetStats_UserIsNotAdmin_ShouldThrowForbiddenException()
        {
            // Arrange: Giả lập một user có quyền Customer (không phải Admin)
            var customerUser = new User { UserId = 1, Role = UserRole.Customer };
            _userRepoMock.Setup(x => x.GetByToken(Token)).Returns(customerUser);

            // Act & Assert: Chạy hàm và mong đợi ném ra ForbiddenException
            var exception = Assert.Throws<ForbiddenException>(() => _dashboardService.GetStats(Token));
            Assert.Equal("Bạn không có quyền truy cập thông tin này.", exception.Message);
        }

        [Fact]
        public void GetStats_UserNotFound_ShouldThrowForbiddenException()
        {
            // Arrange: Token sai hoặc không tìm thấy user tương ứng
            _userRepoMock.Setup(x => x.GetByToken(Token)).Returns((User?)null);

            // Act & Assert
            Assert.Throws<ForbiddenException>(() => _dashboardService.GetStats(Token));
        }

        #endregion

        #region 2. TEST CASES FOR REVENUE GROWTH LOGIC

        [Fact]
        public void GetStats_Growth_RevenueLastWeekExists_ShouldCalculateCorrectPercentage()
        {
            // Arrange: Set up Admin và dữ liệu doanh thu tuần trước = 10tr, tuần này = 15tr (Tăng trưởng 50%)
            var adminUser = new User { UserId = 2, Role = UserRole.Admin };
            _userRepoMock.Setup(x => x.GetByToken(Token)).Returns(adminUser);
            _userRepoMock.Setup(x => x.GetAll()).Returns(new List<User>());

            var today = DateTime.UtcNow.Date;
            var orders = new List<Order>
            {
                // Tuần trước (tính từ cách đây 14 ngày đến trước cách đây 7 ngày)
                new() { TotalAmount = 10000000m, PaymentStatus = PaymentStatus.Paid, CreatedAt = today.AddDays(-10) },
                // Tuần này (tính trong vòng 7 ngày qua)
                new() { TotalAmount = 15000000m, PaymentStatus = PaymentStatus.Paid, CreatedAt = today.AddDays(-3) }
            };
            _orderRepoMock.Setup(x => x.GetAll()).Returns(orders);

            // Act
            var result = _dashboardService.GetStats(Token);

            // Assert
            Assert.NotNull(result);
            // Công thức: ((15tr - 10tr) / 10tr) * 100 = 50%
            Assert.Equal(50.0, result.RevenueGrowthPercentage); 
        }

        [Fact]
        public void GetStats_Growth_RevenueLastWeekIsZero_ButThisWeekHasRevenue_ShouldReturn100Percent()
        {
            // Arrange: Tuần trước doanh thu = 0, Tuần này doanh thu = 5tr
            var adminUser = new User { UserId = 2, Role = UserRole.Admin };
            _userRepoMock.Setup(x => x.GetByToken(Token)).Returns(adminUser);
            _userRepoMock.Setup(x => x.GetAll()).Returns(new List<User>());

            var today = DateTime.UtcNow.Date;
            var orders = new List<Order>
            {
                new() { TotalAmount = 5000000m, PaymentStatus = PaymentStatus.Paid, CreatedAt = today.AddDays(-2) }
            };
            _orderRepoMock.Setup(x => x.GetAll()).Returns(orders);

            // Act
            var result = _dashboardService.GetStats(Token);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(100.0, result.RevenueGrowthPercentage); // Biên: Tuần trước = 0 -> Tăng trưởng mặc định 100%
        }

        [Fact]
        public void GetStats_Growth_BothWeeksAreZero_ShouldReturnZeroPercent()
        {
            // Arrange: Cả hai tuần đều không phát sinh doanh thu nào
            var adminUser = new User { UserId = 2, Role = UserRole.Admin };
            _userRepoMock.Setup(x => x.GetByToken(Token)).Returns(adminUser);
            _userRepoMock.Setup(x => x.GetAll()).Returns(new List<User>());
            _orderRepoMock.Setup(x => x.GetAll()).Returns(new List<Order>());

            // Act
            var result = _dashboardService.GetStats(Token);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(0.0, result.RevenueGrowthPercentage);
        }

        #endregion

        #region 3. TEST CASES FOR CHART DATA (LAST 7 DAYS)

        [Fact]
        public void GetStats_ChartData_ShouldReturnExactly7Days_WithCorrectMatchingRevenue()
        {
            // Arrange
            var adminUser = new User { UserId = 2, Role = UserRole.Admin };
            _userRepoMock.Setup(x => x.GetByToken(Token)).Returns(adminUser);
            _userRepoMock.Setup(x => x.GetAll()).Returns(new List<User>());

            var today = DateTime.UtcNow.Date;
            var orders = new List<Order>
            {
                // Có 2 đơn đã thanh toán ngày hôm nay
                new() { TotalAmount = 200000m, PaymentStatus = PaymentStatus.Paid, CreatedAt = today.AddHours(2) },
                new() { TotalAmount = 300000m, PaymentStatus = PaymentStatus.Paid, CreatedAt = today.AddHours(5) },
                // Có 1 đơn ngày hôm qua
                new() { TotalAmount = 150000m, PaymentStatus = PaymentStatus.Paid, CreatedAt = today.AddDays(-1).AddHours(3) },
                // Đơn này hôm qua nhưng chưa thanh toán/bị hủy -> Không được tính vào doanh thu biểu đồ
                new() { TotalAmount = 999000m, PaymentStatus = PaymentStatus.Pending, Status = OrderStatus.PendingPayment, CreatedAt = today.AddDays(-1) }
            };
            _orderRepoMock.Setup(x => x.GetAll()).Returns(orders);

            // Act
            var result = _dashboardService.GetStats(Token);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(7, result.RevenueChart.Count); // Biểu đồ bắt buộc phải có đủ 7 phần tử

            // Lấy phần tử cuối cùng (tương ứng với i = 0, tức là ngày hôm nay)
            var todayChartItem = result.RevenueChart.Last();
            Assert.Equal(today.ToString("dd/MM"), todayChartItem.Date);
            Assert.Equal(500000m, todayChartItem.Revenue); // 200k + 300k = 500k

            // Lấy phần tử kế cuối (tương ứng với ngày hôm qua)
            var yesterdayChartItem = result.RevenueChart.ElementAt(result.RevenueChart.Count - 2);
            Assert.Equal(today.AddDays(-1).ToString("dd/MM"), yesterdayChartItem.Date);
            Assert.Equal(150000m, yesterdayChartItem.Revenue); // Chỉ tính đơn đã Paid, bỏ đơn Pending
        }

        #endregion
    }
}