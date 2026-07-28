namespace VerstaDeliveryOrders.Api.Contracts;

public sealed class OrderResponse
{
    public long Id { get; init; }
    public required string OrderNumber { get; init; }
    public required string SenderCity { get; init; }
    public required string SenderAddress { get; init; }
    public required string RecipientCity { get; init; }
    public required string RecipientAddress { get; init; }
    public decimal Weight { get; init; }
    public DateTime PickupDate { get; init; }
    public DateTime CreatedAtUtc { get; init; }
}
