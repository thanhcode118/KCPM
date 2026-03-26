using HomeDecorShop.Domain;

namespace HomeDecorShop.Application;

public sealed class ProductService(IProductRepository repository) : IProductService
{
    public Product? GetById(int id) => repository.GetById(id);

    public ProductListResult Search(ProductQuery input)
    {
        var page = Math.Max(input.Page, 1);
        var pageSize = Math.Clamp(input.PageSize, 1, 100);
        var normalizedSort = Normalize(input.SortBy);
        var normalizedQuery = Normalize(input.Query);
        var categories = ParseList(input.Category);
        var brands = ParseList(input.Brand);
        var styles = ParseList(input.Style);

        IEnumerable<Product> query = repository.GetAll().Where(p => p.IsActive);

        if (!string.IsNullOrWhiteSpace(normalizedQuery))
        {
            query = query.Where(p => MatchesSearch(p, normalizedQuery));
        }

        if (categories.Count > 0)
        {
            query = query.Where(p => categories.Contains(Normalize(p.Category)));
        }

        if (brands.Count > 0)
        {
            query = query.Where(p => brands.Contains(Normalize(p.Brand)));
        }

        if (styles.Count > 0)
        {
            query = query.Where(p => styles.Contains(Normalize(p.Style)));
        }

        if (input.MinPrice is not null)
        {
            query = query.Where(p => p.Price >= input.MinPrice.Value);
        }

        if (input.MaxPrice is not null)
        {
            query = query.Where(p => p.Price <= input.MaxPrice.Value);
        }

        if (input.InStockOnly)
        {
            query = query.Where(IsInStock);
        }

        if (input.OnSaleOnly)
        {
            query = query.Where(IsOnSale);
        }

        if (input.RatingGte is not null)
        {
            var minRating = Math.Clamp(input.RatingGte.Value, 0, 5);
            query = query.Where(p => p.Rating >= minRating);
        }

        var sorted = ApplySorting(query, normalizedSort, normalizedQuery).ToArray();
        var total = sorted.Length;
        var items = sorted
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToArray();

        var sortBy = string.IsNullOrWhiteSpace(normalizedSort) ? "relevance" : normalizedSort;
        return new ProductListResult(items, total, page, pageSize, sortBy);
    }

    public Product Create(ProductUpsertInput input)
    {
        var now = DateTime.UtcNow;
        var product = new Product
        {
            ProductId = 0,
            Sku = input.Sku.Trim(),
            ProductName = input.Name.Trim(),
            Slug = input.Slug.Trim(),
            Price = input.Price,
            OldPrice = input.OriginalPrice,
            CategoryId = input.CategoryId,
            Category = input.Category.Trim(),
            Image = input.Image.Trim(),
            HoverImage = input.HoverImage.Trim(),
            VideoUrl = string.IsNullOrWhiteSpace(input.VideoUrl) ? null : input.VideoUrl.Trim(),
            Tag = string.IsNullOrWhiteSpace(input.Tag) ? null : input.Tag.Trim(),
            SoldPercentage = input.SoldPercentage,
            StockLeft = Math.Max(input.StockLeft, 0),
            Rating = Math.Clamp(input.Rating, 0, 5),
            Reviews = Math.Max(input.Reviews, 0),
            Brand = input.Brand.Trim(),
            Color = input.Color.Trim(),
            Material = input.Material.Trim(),
            Style = input.Style.Trim(),
            InStock = input.InStock,
            IsActive = input.IsActive,
            CreatedAt = now
        };

        return repository.Create(product);
    }

    public Product? Update(int id, ProductUpsertInput input)
    {
        var existing = repository.GetById(id);
        if (existing is null)
        {
            return null;
        }

        existing.Sku = input.Sku.Trim();
        existing.ProductName = input.Name.Trim();
        existing.Slug = input.Slug.Trim();
        existing.Price = input.Price;
        existing.OldPrice = input.OriginalPrice;
        existing.CategoryId = input.CategoryId;
        existing.Category = input.Category.Trim();
        existing.Image = input.Image.Trim();
        existing.HoverImage = input.HoverImage.Trim();
        existing.VideoUrl = string.IsNullOrWhiteSpace(input.VideoUrl) ? null : input.VideoUrl.Trim();
        existing.Tag = string.IsNullOrWhiteSpace(input.Tag) ? null : input.Tag.Trim();
        existing.SoldPercentage = input.SoldPercentage;
        existing.StockLeft = Math.Max(input.StockLeft, 0);
        existing.Rating = Math.Clamp(input.Rating, 0, 5);
        existing.Reviews = Math.Max(input.Reviews, 0);
        existing.Brand = input.Brand.Trim();
        existing.Color = input.Color.Trim();
        existing.Material = input.Material.Trim();
        existing.Style = input.Style.Trim();
        existing.InStock = input.InStock;
        existing.IsActive = input.IsActive;

        return repository.Update(existing);
    }

    public bool Delete(int id) => repository.Delete(id);

    private static IEnumerable<Product> ApplySorting(
        IEnumerable<Product> query,
        string normalizedSort,
        string normalizedQuery)
    {
        return normalizedSort switch
        {
            "price-asc" or "price_asc" => query
                .OrderBy(p => p.Price)
                .ThenByDescending(p => p.ProductId),
            "price-desc" or "price_desc" => query
                .OrderByDescending(p => p.Price)
                .ThenByDescending(p => p.ProductId),
            "rating-desc" or "best_selling" => query
                .OrderByDescending(p => p.Rating)
                .ThenByDescending(p => p.Reviews)
                .ThenByDescending(p => p.ProductId),
            "newest" => query
                .OrderByDescending(p => p.CreatedAt)
                .ThenByDescending(p => p.ProductId),
            _ => string.IsNullOrWhiteSpace(normalizedQuery)
                ? query
                    .OrderByDescending(p => p.CreatedAt)
                    .ThenByDescending(p => p.ProductId)
                : query
                    .OrderByDescending(p => GetRelevanceScore(p, normalizedQuery))
                    .ThenByDescending(p => p.Rating)
                    .ThenByDescending(p => p.Reviews)
                    .ThenByDescending(p => p.ProductId)
        };
    }

    private static bool MatchesSearch(Product product, string query)
    {
        var terms = new[]
        {
            product.ProductName,
            product.Sku,
            product.Category,
            product.Brand,
            product.Style,
            product.Material,
            product.Color
        };

        return terms.Any(term => Normalize(term).Contains(query, StringComparison.Ordinal));
    }

    private static bool IsInStock(Product product) =>
        product.InStock || product.StockLeft > 0;

    private static bool IsOnSale(Product product) =>
        product.OldPrice is not null && product.OldPrice > product.Price;

    private static int GetRelevanceScore(Product product, string query)
    {
        var score = 0;
        var name = Normalize(product.ProductName);
        var sku = Normalize(product.Sku);
        var category = Normalize(product.Category);
        var brand = Normalize(product.Brand);
        var style = Normalize(product.Style);
        var material = Normalize(product.Material);
        var color = Normalize(product.Color);

        if (name == query) score += 100;
        if (name.StartsWith(query, StringComparison.Ordinal)) score += 40;
        if (name.Contains(query, StringComparison.Ordinal)) score += 30;
        if (sku.Contains(query, StringComparison.Ordinal)) score += 25;
        if (category.Contains(query, StringComparison.Ordinal)) score += 18;
        if (brand.Contains(query, StringComparison.Ordinal)) score += 15;
        if (style.Contains(query, StringComparison.Ordinal)) score += 12;
        if (material.Contains(query, StringComparison.Ordinal)) score += 10;
        if (color.Contains(query, StringComparison.Ordinal)) score += 8;

        score += (int)Math.Round(product.Rating * 2, MidpointRounding.AwayFromZero);
        score += Math.Min(product.Reviews / 50, 8);

        if (IsInStock(product)) score += 6;
        if (IsOnSale(product)) score += 4;

        return score;
    }

    private static string Normalize(string? value) =>
        (value ?? string.Empty).Trim().ToLowerInvariant();

    private static List<string> ParseList(string? raw)
    {
        if (string.IsNullOrWhiteSpace(raw))
        {
            return [];
        }

        return raw
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Select(Normalize)
            .Where(v => !string.IsNullOrWhiteSpace(v))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();
    }
}
