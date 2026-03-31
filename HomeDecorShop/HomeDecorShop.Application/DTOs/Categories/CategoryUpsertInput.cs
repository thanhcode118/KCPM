using System.ComponentModel.DataAnnotations;

namespace HomeDecorShop.Application;

public sealed class CategoryUpsertInput
{
    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string Name { get; init; } = string.Empty;

    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string Slug { get; init; } = string.Empty;

    public bool IsActive { get; init; }
}
