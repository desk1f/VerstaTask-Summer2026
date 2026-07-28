namespace VerstaDeliveryOrders.Api.Models;

public sealed class Order
{
    public long Id { get; set; }
    public required string SenderCity { get; set; }
    public required string SenderAddress { get; set; }
    public required string RecipientCity { get; set; }
    public required string RecipientAddress { get; set; }
    public decimal Weight { get; set; }
    public DateTime PickupDate { get; set; }
    public DateTime CreatedAtUtc { get; set; }
}
