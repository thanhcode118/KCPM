using HomeDecorShop.Application;
using HomeDecorShop.Domain;

namespace HomeDecorShop.Infrastructure;

public sealed class SqlCategoryRepository(AppDbContext context) : ICategoryRepository
{
    public IReadOnlyCollection<Category> GetAll() =>
        context.Categories
            .OrderBy(category => category.Name)
            .ToList();

    public Category? GetById(int categoryId) =>
        context.Categories.FirstOrDefault(category => category.Id == categoryId);

    public Category? GetBySlug(string slug) =>
        context.Categories.FirstOrDefault(category => category.Slug == slug);

    public Category Create(Category category)
    {
        context.Categories.Add(category);
        context.SaveChanges();
        return category;
    }

    public Category? Update(Category category)
    {
        foreach (var product in context.Products.Where(product => product.CategoryId == category.Id))
        {
            product.Category = category.Name;
        }

        context.Categories.Update(category);
        context.SaveChanges();
        return category;
    }

    public bool Delete(int categoryId)
    {
        var category = GetById(categoryId);
        if (category is null)
        {
            return false;
        }

        context.Categories.Remove(category);
        context.SaveChanges();
        return true;
    }

    public bool HasProducts(int categoryId) =>
        context.Products.Any(product => product.CategoryId == categoryId);

    public bool HasActiveProducts(int categoryId) =>
        context.Products.Any(product => product.CategoryId == categoryId && product.IsActive);
}
