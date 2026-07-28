namespace VerstaDeliveryOrders.Api.Contracts;

public sealed class CreateOrderRequest
{
    public string? SenderCity { get; init; }
    public string? SenderAddress { get; init; }
    public string? RecipientCity { get; init; }
    public string? RecipientAddress { get; init; }
    public decimal Weight { get; init; }
    public DateTime PickupDate { get; init; }
}
