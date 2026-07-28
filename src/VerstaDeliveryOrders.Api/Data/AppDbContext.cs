using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using VerstaDeliveryOrders.Api.Models;

namespace VerstaDeliveryOrders.Api.Data;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    private static readonly ValueConverter<DateTime, DateTime> UtcDateTimeConverter = new(
        value => value.Kind == DateTimeKind.Utc ? value : value.ToUniversalTime(),
        value => DateTime.SpecifyKind(value, DateTimeKind.Utc));

    public DbSet<Order> Orders => Set<Order>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        var order = modelBuilder.Entity<Order>();
        order.Property(item => item.SenderCity).HasMaxLength(100).IsRequired();
        order.Property(item => item.SenderAddress).HasMaxLength(250).IsRequired();
        order.Property(item => item.RecipientCity).HasMaxLength(100).IsRequired();
        order.Property(item => item.RecipientAddress).HasMaxLength(250).IsRequired();
        order.Property(item => item.Weight).HasPrecision(10, 2);
        order.Property(item => item.PickupDate).IsRequired();
        order.Property(item => item.CreatedAtUtc).HasConversion(UtcDateTimeConverter).IsRequired();
    }
}
