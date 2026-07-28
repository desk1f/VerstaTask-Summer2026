using Microsoft.EntityFrameworkCore;
using VerstaDeliveryOrders.Api.Models;

namespace VerstaDeliveryOrders.Api.Data;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
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
        order.Property(item => item.CreatedAtUtc).IsRequired();
    }
}
