using HomeDecorShop.Domain;
using Microsoft.Extensions.DependencyInjection;
using BCrypt.Net; // Thêm thư viện này

namespace HomeDecorShop.Application;

public sealed record UserView(
    int Id, string Email, string FullName, string Phone, string Role,
    DateTime CreatedAt, IReadOnlyCollection<AddressView> Addresses); // Update Address view

public sealed record AddressView(
    int Id, string FullName, string Phone, string Line1, string Ward,
    string District, string City, bool IsDefault);

public sealed record RegisterUserInput(string Email, string FullName, string Phone, string Password, string Role);
public sealed record LoginInput(string Email, string Password);
public sealed record UpdateProfileInput(string FullName, string Phone);
public sealed record UpsertAddressInput(string FullName, string Phone, string Line1, string Ward, string District, string City, bool IsDefault);
public sealed record AuthResult(string Token, UserView User);

public interface IUserService
{
    IReadOnlyCollection<UserView> GetAll();
    AuthResult Register(RegisterUserInput input);
    AuthResult? Login(LoginInput input);
    UserView? GetByToken(string token);
    UserView? UpdateProfile(string token, UpdateProfileInput input);
    UserView? AddAddress(string token, UpsertAddressInput input);
}

public sealed class UserService : IUserService
{
    private readonly IUserRepository _repository;

    public UserService(IUserRepository repository)
    {
        _repository = repository;
    }

    public IReadOnlyCollection<UserView> GetAll() =>
        _repository.GetAll().Select(MapUser).ToArray();

    public AuthResult Register(RegisterUserInput input)
    {
        var normalizedEmail = Normalize(input.Email);
        if (_repository.GetByEmail(normalizedEmail) is not null)
        {
            throw new InvalidOperationException("Email đã tồn tại trong hệ thống.");
        }

        var role = Normalize(input.Role) == "admin" ? UserRole.Admin : UserRole.Customer;
        var token = Guid.NewGuid().ToString("N");

        var user = new User
        {
            Email = normalizedEmail,
            FullName = input.FullName.Trim(),
            Phone = input.Phone?.Trim() ?? string.Empty,
            Role = role,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(input.Password), // Mã hóa Password
            CreatedAt = DateTime.UtcNow,
            CurrentToken = token,
            Addresses = new List<Address>()
        };

        var createdUser = _repository.Create(user);
        return new AuthResult(token, MapUser(createdUser));
    }

    public AuthResult? Login(LoginInput input)
    {
        var user = _repository.GetByEmail(Normalize(input.Email));
        
        // Kiểm tra mật khẩu bằng BCrypt
        if (user is null || !BCrypt.Net.BCrypt.Verify(input.Password, user.PasswordHash))
        {
            return null;
        }

        // Cấp lại token mới mỗi lần login
        user.CurrentToken = Guid.NewGuid().ToString("N");
        _repository.Update(user);

        return new AuthResult(user.CurrentToken, MapUser(user));
    }

    public UserView? GetByToken(string token)
    {
        if (string.IsNullOrWhiteSpace(token)) return null;
        var user = _repository.GetByToken(token.Trim());
        return user is null ? null : MapUser(user);
    }

    public UserView? UpdateProfile(string token, UpdateProfileInput input)
    {
        var user = _repository.GetByToken(token);
        if (user is null) return null;

        user.FullName = input.FullName.Trim();
        user.Phone = input.Phone.Trim();

        var saved = _repository.Update(user);
        return saved is null ? null : MapUser(saved);
    }

    public UserView? AddAddress(string token, UpsertAddressInput input)
    {
        var user = _repository.GetByToken(token);
        if (user is null) return null;

        var newAddress = new Address
        {
            FullName = input.FullName.Trim(),
            Phone = input.Phone.Trim(),
            Line1 = input.Line1.Trim(),
            Ward = input.Ward.Trim(),
            District = input.District.Trim(),
            City = input.City.Trim(),
            IsDefault = input.IsDefault
        };

        if (newAddress.IsDefault)
        {
            foreach (var a in user.Addresses)
            {
                a.IsDefault = false;
            }
        }
        
        user.Addresses.Add(newAddress);
        var saved = _repository.Update(user);
        return saved is null ? null : MapUser(saved);
    }

    private static UserView MapUser(User user) =>
        new(
            user.Id,
            user.Email,
            user.FullName,
            user.Phone,
            user.Role.ToString().ToLowerInvariant(),
            user.CreatedAt,
            user.Addresses.Select(a => new AddressView(a.Id, a.FullName, a.Phone, a.Line1, a.Ward, a.District, a.City, a.IsDefault)).ToArray());

    private static string Normalize(string? value) =>
        (value ?? string.Empty).Trim().ToLowerInvariant();
}

public static class ApplicationDependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IProductService, ProductService>();
        services.AddScoped<IUserService, UserService>();
        return services;
    }
}