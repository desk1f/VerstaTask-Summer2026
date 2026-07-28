using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using VerstaDeliveryOrders.Api.Contracts;
using VerstaDeliveryOrders.Api.Controllers;
using VerstaDeliveryOrders.Api.Data;
using VerstaDeliveryOrders.Api.Formatting;
using VerstaDeliveryOrders.Api.Models;

namespace VerstaDeliveryOrders.Tests;

public sealed class OrdersControllerTests
{
    [Fact]
    public async Task Create_ValidRequest_ReturnsCreatedOrderAndTrimsText()
    {
        await using var fixture = await TestFixture.CreateAsync();
        var result = await fixture.Controller.Create(
            ValidRequest(senderCity: "  Санкт-Петербург  "),
            CancellationToken.None);

        var created = Assert.IsType<CreatedAtActionResult>(result.Result);
        var order = Assert.IsType<OrderResponse>(created.Value);

        Assert.Equal(1, order.Id);
        Assert.Equal("000001", order.OrderNumber);
        Assert.Equal("Санкт-Петербург", order.SenderCity);
        Assert.Equal(nameof(OrdersController.GetById), created.ActionName);
        Assert.Equal(1L, created.RouteValues!["id"]);
    }

    [Fact]
    public async Task Create_MissingFields_ReturnsValidationProblem()
    {
        await using var fixture = await TestFixture.CreateAsync();
        var result = await fixture.Controller.Create(new CreateOrderRequest(), CancellationToken.None);

        var badRequest = Assert.IsType<BadRequestObjectResult>(result.Result);
        var details = Assert.IsType<ValidationProblemDetails>(badRequest.Value);

        Assert.Contains("senderCity", details.Errors.Keys);
        Assert.Contains("pickupDate", details.Errors.Keys);
    }

    [Fact]
    public async Task Create_WhitespaceOnlyText_ReturnsValidationProblem()
    {
        await using var fixture = await TestFixture.CreateAsync();
        var result = await fixture.Controller.Create(
            ValidRequest(recipientAddress: "   "),
            CancellationToken.None);

        var badRequest = Assert.IsType<BadRequestObjectResult>(result.Result);
        var details = Assert.IsType<ValidationProblemDetails>(badRequest.Value);

        Assert.Contains("recipientAddress", details.Errors.Keys);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-0.5)]
    public async Task Create_NonPositiveWeight_ReturnsValidationProblem(decimal weight)
    {
        await using var fixture = await TestFixture.CreateAsync();
        var result = await fixture.Controller.Create(ValidRequest(weight: weight), CancellationToken.None);

        var badRequest = Assert.IsType<BadRequestObjectResult>(result.Result);
        var details = Assert.IsType<ValidationProblemDetails>(badRequest.Value);

        Assert.Contains("weight", details.Errors.Keys);
    }

    [Theory]
    [InlineData(1, "000001")]
    [InlineData(42, "000042")]
    [InlineData(1234567, "1234567")]
    public void OrderNumberFormatter_FormatsDatabaseId(long id, string expected)
    {
        Assert.Equal(expected, OrderNumberFormatter.Format(id));
    }

    [Fact]
    public async Task Create_AssignsUtcCreationTimeOnServer()
    {
        await using var fixture = await TestFixture.CreateAsync();
        var before = DateTime.UtcNow;
        var result = await fixture.Controller.Create(ValidRequest(), CancellationToken.None);
        var after = DateTime.UtcNow;

        var created = Assert.IsType<CreatedAtActionResult>(result.Result);
        var order = Assert.IsType<OrderResponse>(created.Value);

        Assert.Equal(DateTimeKind.Utc, order.CreatedAtUtc.Kind);
        Assert.InRange(order.CreatedAtUtc, before, after);
    }

    [Fact]
    public async Task GetAll_SortsByCreationTimeThenIdDescending()
    {
        await using var fixture = await TestFixture.CreateAsync();
        var sameDate = new DateTime(2026, 7, 28, 12, 0, 0, DateTimeKind.Utc);
        fixture.Db.Orders.AddRange(
            Order("Первый", sameDate),
            Order("Второй", sameDate),
            Order("Третий", sameDate.AddMinutes(1)));
        await fixture.Db.SaveChangesAsync();

        var result = await fixture.Controller.GetAll(CancellationToken.None);
        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var orders = Assert.IsAssignableFrom<IReadOnlyList<OrderResponse>>(ok.Value);

        Assert.Equal(["Третий", "Второй", "Первый"], orders.Select(order => order.SenderCity));
    }

    [Fact]
    public async Task GetById_ExistingOrder_ReturnsOrder()
    {
        await using var fixture = await TestFixture.CreateAsync();
        var entity = Order("Санкт-Петербург", DateTime.UtcNow);
        fixture.Db.Orders.Add(entity);
        await fixture.Db.SaveChangesAsync();

        var result = await fixture.Controller.GetById(entity.Id, CancellationToken.None);
        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var order = Assert.IsType<OrderResponse>(ok.Value);

        Assert.Equal(entity.Id, order.Id);
        Assert.Equal("000001", order.OrderNumber);
    }

    [Fact]
    public async Task GetById_MissingOrder_ReturnsNotFound()
    {
        await using var fixture = await TestFixture.CreateAsync();
        var result = await fixture.Controller.GetById(42, CancellationToken.None);

        Assert.IsType<NotFoundResult>(result.Result);
    }

    private static CreateOrderRequest ValidRequest(
        string senderCity = "Санкт-Петербург",
        string recipientAddress = "Тверская улица, 1",
        decimal weight = 2.5m) => new()
    {
        SenderCity = senderCity,
        SenderAddress = "Невский проспект, 1",
        RecipientCity = "Москва",
        RecipientAddress = recipientAddress,
        Weight = weight,
        PickupDate = new DateTime(2026, 7, 31)
    };

    private static Order Order(string senderCity, DateTime createdAtUtc) => new()
    {
        SenderCity = senderCity,
        SenderAddress = "Адрес отправителя",
        RecipientCity = "Москва",
        RecipientAddress = "Адрес получателя",
        Weight = 1.25m,
        PickupDate = new DateTime(2026, 7, 31),
        CreatedAtUtc = createdAtUtc
    };

    private sealed class TestFixture : IAsyncDisposable
    {
        private readonly SqliteConnection connection;

        private TestFixture(SqliteConnection connection, AppDbContext db)
        {
            this.connection = connection;
            Db = db;
            Controller = new OrdersController(db);
        }

        public AppDbContext Db { get; }

        public OrdersController Controller { get; }

        public static async Task<TestFixture> CreateAsync()
        {
            var connection = new SqliteConnection("Data Source=:memory:");
            await connection.OpenAsync();
            var options = new DbContextOptionsBuilder<AppDbContext>().UseSqlite(connection).Options;
            var db = new AppDbContext(options);
            await db.Database.EnsureCreatedAsync();
            return new TestFixture(connection, db);
        }

        public async ValueTask DisposeAsync()
        {
            await Db.DisposeAsync();
            await connection.DisposeAsync();
        }
    }
}
