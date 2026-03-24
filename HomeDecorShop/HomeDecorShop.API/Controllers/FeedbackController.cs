using Microsoft.AspNetCore.Mvc;
using HomeDecorShop.Application.Feedbacks;

namespace HomeDecorShop.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FeedbackController : ControllerBase
{
    [HttpPost]
    public IActionResult Create(
        [FromServices] CreateFeedbackHandler handler,
        [FromBody] CreateFeedbackCommand command)
    {
        var result = handler.Handle(command);
        return CreatedAtAction(nameof(GetAll), new { id = result.FeedbackId }, result);
    }

    [HttpGet]
    public IActionResult GetAll([FromServices] GetFeedbacksHandler handler)
    {
        var feedbacks = handler.Handle(new GetFeedbacksQuery());
        return Ok(feedbacks);
    }
}
