using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VerstaDeliveryOrders.Api.Contracts;
using VerstaDeliveryOrders.Api.Data;
using VerstaDeliveryOrders.Api.Formatting;
using VerstaDeliveryOrders.Api.Models;

namespace VerstaDeliveryOrders.Api.Controllers;

[ApiController]
[Route("api/orders")]
public sealed class OrdersController(AppDbContext dbContext) : ControllerBase
{
    [HttpPost]
    [ProducesResponseType(typeof(OrderResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<OrderResponse>> Create(
        [FromBody] CreateOrderRequest request,
        CancellationToken cancellationToken)
    {
        var errors = Validate(request);
        if (errors.Count > 0)
        {
            return BadRequest(new ValidationProblemDetails(errors)
            {
                Status = StatusCodes.Status400BadRequest
            });
        }

        var order = new Order
        {
            SenderCity = request.SenderCity!.Trim(),
            SenderAddress = request.SenderAddress!.Trim(),
            RecipientCity = request.RecipientCity!.Trim(),
            RecipientAddress = request.RecipientAddress!.Trim(),
            Weight = request.Weight,
            PickupDate = request.PickupDate.Date,
            CreatedAtUtc = DateTime.UtcNow
        };

        dbContext.Orders.Add(order);
        await dbContext.SaveChangesAsync(cancellationToken);

        var response = Map(order);
        return CreatedAtAction(nameof(GetById), new { id = order.Id }, response);
    }

    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<OrderResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<OrderResponse>>> GetAll(CancellationToken cancellationToken)
    {
        var orders = await dbContext.Orders
            .AsNoTracking()
            .OrderByDescending(order => order.CreatedAtUtc)
            .ThenByDescending(order => order.Id)
            .Select(order => new OrderResponse
            {
                Id = order.Id,
                OrderNumber = OrderNumberFormatter.Format(order.Id),
                SenderCity = order.SenderCity,
                SenderAddress = order.SenderAddress,
                RecipientCity = order.RecipientCity,
                RecipientAddress = order.RecipientAddress,
                Weight = order.Weight,
                PickupDate = order.PickupDate,
                CreatedAtUtc = order.CreatedAtUtc
            })
            .ToListAsync(cancellationToken);

        return Ok(orders);
    }

    [HttpGet("{id:long}")]
    [ProducesResponseType(typeof(OrderResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<OrderResponse>> GetById(long id, CancellationToken cancellationToken)
    {
        var order = await dbContext.Orders
            .AsNoTracking()
            .SingleOrDefaultAsync(item => item.Id == id, cancellationToken);

        return order is null ? NotFound() : Ok(Map(order));
    }

    private static Dictionary<string, string[]> Validate(CreateOrderRequest request)
    {
        var errors = new Dictionary<string, string[]>();
        ValidateText(request.SenderCity, "senderCity", "Город отправителя", 100, errors);
        ValidateText(request.SenderAddress, "senderAddress", "Адрес отправителя", 250, errors);
        ValidateText(request.RecipientCity, "recipientCity", "Город получателя", 100, errors);
        ValidateText(request.RecipientAddress, "recipientAddress", "Адрес получателя", 250, errors);

        if (request.Weight <= 0)
        {
            errors["weight"] = ["Вес груза должен быть больше нуля."];
        }

        if (request.PickupDate == default)
        {
            errors["pickupDate"] = ["Укажите дату забора груза."];
        }

        return errors;
    }

    private static void ValidateText(
        string? value,
        string field,
        string label,
        int maxLength,
        IDictionary<string, string[]> errors)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            errors[field] = [$"Поле «{label}» обязательно для заполнения."];
        }
        else if (value.Trim().Length > maxLength)
        {
            errors[field] = [$"Поле «{label}» не должно превышать {maxLength} символов."];
        }
    }

    private static OrderResponse Map(Order order) => new()
    {
        Id = order.Id,
        OrderNumber = OrderNumberFormatter.Format(order.Id),
        SenderCity = order.SenderCity,
        SenderAddress = order.SenderAddress,
        RecipientCity = order.RecipientCity,
        RecipientAddress = order.RecipientAddress,
        Weight = order.Weight,
        PickupDate = order.PickupDate,
        CreatedAtUtc = order.CreatedAtUtc
    };
}
