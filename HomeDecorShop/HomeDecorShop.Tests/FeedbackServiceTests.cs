using Xunit;
using Moq;
using HomeDecorShop.Domain;
using HomeDecorShop.Application;

namespace HomeDecorShop.Tests.Services
{
    public class FeedbackServiceTests
    {
        private readonly Mock<IFeedbackRepository> _feedbackRepoMock;
        private readonly FeedbackService _feedbackService;

        public FeedbackServiceTests()
        {
            _feedbackRepoMock = new Mock<IFeedbackRepository>();
            _feedbackService = new FeedbackService(_feedbackRepoMock.Object);
        }

        #region 1. TEST CASES FOR READ OPERATIONS (GET)

        [Fact]
        public void GetAll_ShouldReturnAllFeedbacks_MappedToViewCorrectly()
        {
            // Arrange: Giả lập danh sách feedback từ Repository
            var feedbacks = new List<Feedback>
            {
                new(1, "User A", "a@gmail.com", "Good product", DateTime.UtcNow.AddDays(-1)),
                new(2, "User B", "b@gmail.com", "Excellent service", DateTime.UtcNow)
            };
            _feedbackRepoMock.Setup(x => x.GetAll()).Returns(feedbacks);

            // Act
            var result = _feedbackService.GetAll();

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Count);
            Assert.Equal("User A", result.First().Name);
            Assert.Equal("b@gmail.com", result.Last().Email);
        }

        [Fact]
        public void GetById_ExistingId_ShouldReturnMappedFeedbackView()
        {
            // Arrange
            var feedback = new Feedback(10, "Nguyen Van A", "test@gmail.com", "Hello", DateTime.UtcNow);
            _feedbackRepoMock.Setup(x => x.GetById(10)).Returns(feedback);

            // Act
            var result = _feedbackService.GetById(10);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(10, result.FeedbackId);
            Assert.Equal("Nguyen Van A", result.Name);
        }

        [Fact]
        public void GetById_NonExistingId_ShouldReturnNull()
        {
            // Arrange
            _feedbackRepoMock.Setup(x => x.GetById(It.IsAny<int>())).Returns((Feedback?)null);

            // Act
            var result = _feedbackService.GetById(999);

            // Assert
            Assert.Null(result);
        }

        #endregion

        #region 2. TEST CASES FOR CREATE & UPDATE (MUTATION)

        [Fact]
        public void Create_ValidInput_ShouldTrimStrings_ConvertEmailToLower_AndSave()
        {
            // Arrange: Đầu vào cố tình chứa khoảng trắng thừa và viết hoa Email
            var input = new FeedbackUpsertInput
            {
                Name = "   Trần Văn B   ",
                Email = "  bAnG@HomeDecor.COM  ",
                Message = "  Sản phẩm rất đẹp!  "
            };

            // Capture object truyền vào hàm Create của Repo để kiểm tra logic xử lý chuỗi
            _feedbackRepoMock
                .Setup(x => x.Create(It.IsAny<Feedback>()))
                .Returns<Feedback>(f => f); // Trả về chính object được truyền vào

            // Act
            var result = _feedbackService.Create(input);

            // Assert
            Assert.NotNull(result);
            
            // Kiểm tra xem Service đã thực hiện Trim() và ToLowerInvariant() đúng như logic thiết kế chưa
            Assert.Equal("Trần Văn B", result.Name);
            Assert.Equal("bang@homedecor.com", result.Email);
            Assert.Equal("Sản phẩm rất đẹp!", result.Message);

            // Xác minh hàm Create của Repository được gọi chính xác 1 lần
            _feedbackRepoMock.Verify(x => x.Create(It.IsAny<Feedback>()), Times.Once);
        }

        [Fact]
        public void Update_ExistingFeedback_ShouldKeepOriginalCreatedAt_AndApplyChanges()
        {
            // Arrange
            int feedbackId = 5;
            var originalCreatedAt = DateTime.UtcNow.AddDays(-5);
            var existingFeedback = new Feedback(feedbackId, "Old Name", "old@gmail.com", "Old Message", originalCreatedAt);

            var input = new FeedbackUpsertInput
            {
                Name = "New Name",
                Email = "new@gmail.com",
                Message = "New Message"
            };

            _feedbackRepoMock.Setup(x => x.GetById(feedbackId)).Returns(existingFeedback);
            _feedbackRepoMock.Setup(x => x.Update(It.IsAny<Feedback>())).Returns<Feedback>(f => f);

            // Act
            var result = _feedbackService.Update(feedbackId, input);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(feedbackId, result.FeedbackId);
            Assert.Equal("New Name", result.Name);
            
            // CỰC KỲ QUÂN TRỌNG: Đảm bảo ngày tạo ban đầu (CreatedAt) KHÔNG bị ghi đè thành ngày hôm nay khi update
            _feedbackRepoMock.Verify(x => x.Update(It.Is<Feedback>(f => f.CreatedAt == originalCreatedAt)), Times.Once);
        }

        [Fact]
        public void Update_NonExistingFeedback_ShouldReturnNullImmediately()
        {
            // Arrange
            _feedbackRepoMock.Setup(x => x.GetById(It.IsAny<int>())).Returns((Feedback?)null);
            var input = new FeedbackUpsertInput { Name = "A", Email = "a@g.com", Message = "M" };

            // Act
            var result = _feedbackService.Update(99, input);

            // Assert
            Assert.Null(result);
            _feedbackRepoMock.Verify(x => x.Update(It.IsAny<Feedback>()), Times.Never); // Không bao giờ gọi hàm Update của Repo nếu ko tìm thấy data
        }

        #endregion

        #region 3. TEST CASES FOR DELETE

        [Fact]
        public void Delete_ShouldReturnRepositoryResult()
        {
            // Arrange
            _feedbackRepoMock.Setup(x => x.Delete(1)).Returns(true);
            _feedbackRepoMock.Setup(x => x.Delete(2)).Returns(false);

            // Act & Assert
            Assert.True(_dashboardService_Or_FeedbackService_CallDelete(1));
            Assert.False(_dashboardService_Or_FeedbackService_CallDelete(2));
        }

        private bool _dashboardService_Or_FeedbackService_CallDelete(int id)
        {
            return _feedbackService.Delete(id);
        }

        #endregion
    }
}