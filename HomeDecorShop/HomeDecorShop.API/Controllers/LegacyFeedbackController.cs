using HomeDecorShop.Application;
using Microsoft.AspNetCore.Mvc;

namespace HomeDecorShop.API.Controllers;

[ApiController]
[ApiExplorerSettings(IgnoreApi = true)]
[Route("api/Feedback")]
public sealed class LegacyFeedbackController(IFeedbackService feedbackService) : ControllerBase
{
    [HttpGet]
    public IActionResult GetAll()
    {
        return Ok(feedbackService.GetAll());
    }

    [HttpPost]
    public IActionResult Create([FromBody] FeedbackUpsertInput input)
    {
        var created = feedbackService.Create(input);
        return Created($"/api/Feedback/{created.FeedbackId}", created);
    }
}
