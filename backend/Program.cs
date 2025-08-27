using backend.Helpers;
using backend.Repositories.Implementations;
using backend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using backend.Models;
using Microsoft.OpenApi.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using backend.Data;
using backend.Services.Interfaces;
using backend.Services.Implementations;

var builder = WebApplication.CreateBuilder(args);
// Cho phép CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.WithOrigins("http://localhost:5173")
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "Device API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new()
    {
        In = ParameterLocation.Header,
        Description = "Nhập token vào đây (Bearer <token>)",
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey
    });
    c.AddSecurityRequirement(new()
    {
        {
            new() { Reference = new() { Type = ReferenceType.SecurityScheme, Id = "Bearer" } },
            new string[] {}
        }
    });
});

// AutoMapper
builder.Services.AddAutoMapper(typeof(AutoMapperProfile));

// Repositories
builder.Services.AddScoped<IDeviceRepository, DeviceRepository>();
// Repository
builder.Services.AddScoped<IUserRepository, UserRepository>();
// Service
builder.Services.AddScoped<IAuthService, AuthService>();

builder.Services.AddScoped<IDeviceModelService, DeviceModelService>();

builder.Services.AddScoped<ISupplierService, SupplierService>();

builder.Services.AddScoped<IDepartmentService, DepartmentService>();

builder.Services.AddScoped<IUserService, UserService>();

builder.Services.AddScoped<IDeviceService, DeviceService>();



builder.Services.AddHttpContextAccessor();

// DbContext
builder.Services.AddDbContext<DeviceManagementDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// JWT Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var key = builder.Configuration["Jwt:Key"];
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key!))
        };
    });

var app = builder.Build();

// Middleware
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowFrontend"); // đặt trước UseAuthorization()

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
