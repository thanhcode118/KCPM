using HomeDecorShop.Domain;

namespace HomeDecorShop.Application.Feedbacks;

public record GetFeedbacksQuery();

public sealed class GetFeedbacksHandler(IFeedbackRepository repository)
{
    public IReadOnlyCollection<Feedback> Handle(GetFeedbacksQuery query)
    {
        return repository.GetAll();
    }
}
