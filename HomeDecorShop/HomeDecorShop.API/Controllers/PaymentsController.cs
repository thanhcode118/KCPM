using HomeDecorShop.Application;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace HomeDecorShop.API.Controllers;

[ApiController]
[Route("api/payments")]
[SwaggerTag("Payment processing endpoints for the currently authenticated user.")]
[ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
public sealed class PaymentsController(IPaymentService paymentService) : ApiControllerBase
{
    [HttpGet]
    [SwaggerOperation(
        Summary = "List current user payments",
        Description = "Returns all payment attempts of the authenticated user ordered by newest first.")]
    [ProducesResponseType(typeof(PaymentView[]), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public ActionResult<IReadOnlyCollection<PaymentView>> GetMine()
    {
        return Ok(paymentService.GetMine(ReadRequiredToken()));
    }

    [HttpGet("{id:int}")]
    [SwaggerOperation(
        Summary = "Get a payment by id",
        Description = "Returns a single payment owned by the authenticated user.")]
    [ProducesResponseType(typeof(PaymentView), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public ActionResult<PaymentView> GetById(int id)
    {
        return Ok(RequireResource(paymentService.GetById(ReadRequiredToken(), id), $"Payment with id {id} was not found."));
    }

    [HttpGet("order/{orderId:int}")]
    [SwaggerOperation(
        Summary = "List payments by order",
        Description = "Returns all payment attempts for a specific order owned by the authenticated user.")]
    [ProducesResponseType(typeof(PaymentView[]), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public ActionResult<IReadOnlyCollection<PaymentView>> GetByOrderId(int orderId)
    {
        return Ok(paymentService.GetByOrderId(ReadRequiredToken(), orderId));
    }

    [HttpPost]
    [SwaggerOperation(
        Summary = "Process a payment",
        Description = "Simulates a payment for an order in pending payment state and marks the order as paid.")]
    [ProducesResponseType(typeof(PaymentView), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public ActionResult<PaymentView> Process([FromBody] PaymentProcessInput input)
    {
        var created = paymentService.Process(ReadRequiredToken(), input);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }
}
