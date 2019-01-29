using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace mobilityAI.Migrations
{
    public partial class mobilityAI : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AccelerometerData",
                columns: table => new
                {
                    Id = table.Column<string>(nullable: false),
                    PatientId = table.Column<int>(nullable: false),
                    Epoch = table.Column<long>(nullable: false),
                    Timestamp = table.Column<DateTime>(nullable: false),
                    Elapsed = table.Column<double>(nullable: false),
                    XAxis = table.Column<double>(nullable: false),
                    YAxis = table.Column<double>(nullable: false),
                    ZAxis = table.Column<double>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AccelerometerData", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Activities",
                columns: table => new
                {
                    Id = table.Column<string>(nullable: false),
                    DeviceId = table.Column<string>(nullable: false),
                    PatientId = table.Column<int>(nullable: false),
                    Start = table.Column<long>(nullable: false),
                    End = table.Column<long>(nullable: false),
                    Type = table.Column<short>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Activities", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Conditions",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    Text = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Conditions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Devices",
                columns: table => new
                {
                    Id = table.Column<string>(nullable: false),
                    FriendlyName = table.Column<string>(nullable: false),
                    PatientID = table.Column<int>(nullable: false),
                    LastSync = table.Column<DateTime>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Devices", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "GyroscopeData",
                columns: table => new
                {
                    Id = table.Column<string>(nullable: false),
                    PatientId = table.Column<int>(nullable: false),
                    Epoch = table.Column<long>(nullable: false),
                    Timestamp = table.Column<DateTime>(nullable: false),
                    Elapsed = table.Column<double>(nullable: false),
                    XAxis = table.Column<double>(nullable: false),
                    YAxis = table.Column<double>(nullable: false),
                    ZAxis = table.Column<double>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GyroscopeData", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "LivingSituations",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    Text = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LivingSituations", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Patients",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    DeviceId = table.Column<string>(nullable: true),
                    FirstName = table.Column<string>(nullable: false),
                    LastName = table.Column<string>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Patients", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Severities",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    Text = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Severities", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    Email = table.Column<string>(nullable: false),
                    FirstName = table.Column<string>(nullable: false),
                    LastName = table.Column<string>(nullable: false),
                    Password = table.Column<string>(nullable: false),
                    Salt = table.Column<string>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "WalkingSituations",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.SerialColumn),
                    Text = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WalkingSituations", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "Conditions",
                columns: new[] { "Id", "Text" },
                values: new object[,]
                {
                    { 1, "Neurologic" },
                    { 2, "Cardiopulmonary" },
                    { 3, "Major Medical Condition" },
                    { 4, "Other" }
                });

            migrationBuilder.InsertData(
                table: "Severities",
                columns: new[] { "Id", "Text" },
                values: new object[,]
                {
                    { 1, "Mildly Severe" },
                    { 2, "Moderately Severe" },
                    { 3, "Extremely Severe" }
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AccelerometerData");

            migrationBuilder.DropTable(
                name: "Activities");

            migrationBuilder.DropTable(
                name: "Conditions");

            migrationBuilder.DropTable(
                name: "Devices");

            migrationBuilder.DropTable(
                name: "GyroscopeData");

            migrationBuilder.DropTable(
                name: "LivingSituations");

            migrationBuilder.DropTable(
                name: "Patients");

            migrationBuilder.DropTable(
                name: "Severities");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "WalkingSituations");
        }
    }
}
