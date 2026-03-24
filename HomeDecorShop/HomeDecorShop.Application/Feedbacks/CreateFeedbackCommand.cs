using HomeDecorShop.Domain;

namespace HomeDecorShop.Application.Feedbacks;

public record CreateFeedbackCommand(string Name, string Email, string Message);

public sealed class CreateFeedbackHandler(IFeedbackRepository repository)
{
    public Feedback Handle(CreateFeedbackCommand command)
    {
        var feedback = new Feedback(
            0,
            command.Name.Trim(),
            command.Email.Trim().ToLower(),
            command.Message.Trim(),
            DateTime.UtcNow);

        return repository.Create(feedback);
    }
}
