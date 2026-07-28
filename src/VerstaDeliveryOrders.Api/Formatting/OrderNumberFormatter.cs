namespace VerstaDeliveryOrders.Api.Formatting;

public static class OrderNumberFormatter
{
    public static string Format(long id) => id.ToString("D6");
}
