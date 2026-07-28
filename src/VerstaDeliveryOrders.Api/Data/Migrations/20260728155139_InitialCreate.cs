using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VerstaDeliveryOrders.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Orders",
                columns: table => new
                {
                    Id = table.Column<long>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    SenderCity = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    SenderAddress = table.Column<string>(type: "TEXT", maxLength: 250, nullable: false),
                    RecipientCity = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    RecipientAddress = table.Column<string>(type: "TEXT", maxLength: 250, nullable: false),
                    Weight = table.Column<decimal>(type: "TEXT", precision: 10, scale: 2, nullable: false),
                    PickupDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Orders", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Orders");
        }
    }
}
