
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HomeDecorShop.Infrastructure;
using System.Text.RegularExpressions;

namespace HomeDecorShop.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MaintenanceController : ControllerBase
    {
        private readonly AppDbContext _context;

        public MaintenanceController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("update-descriptions")]
        public async Task<IActionResult> UpdateDescriptions()
        {
            try
            {
                string filePath = @"c:\Users\Dell\OneDrive\Desktop\TMDT_Nhom6\SanPham.txt";
                if (!System.IO.File.Exists(filePath)) return NotFound("SanPham.txt not found");

                string text = await System.IO.File.ReadAllTextAsync(filePath);
                var products = text.Split(new[] { "===== SẢN PHẨM" }, StringSplitOptions.RemoveEmptyEntries);
                
                int updatedCount = 0;
                foreach (var p in products)
                {
                    var match = Regex.Match(p, @"^ \d+: (.*?) =====\s+Mô tả:\s+(.*?)\s+Thông số:\s+(.*?)\s+Chất liệu:\s+(.*?)\s+Phong cách:\s+(.*?)\s+Giá:", RegexOptions.Singleline);
                    if (match.Success)
                    {
                        string name = match.Groups[1].Value.Trim();
                        string description = match.Groups[2].Value.Trim();
                        string specs = match.Groups[3].Value.Trim();
                        string material = match.Groups[4].Value.Trim();
                        string style = match.Groups[5].Value.Trim();
                        
                        string fullDesc = $"{description}\n\n[THÔNG SỐ]\n{specs}\n\n[CHẤT LIỆU]: {material}\n[PHONG CÁCH]: {style}";
                        
                        var dbProduct = await _context.Products.FirstOrDefaultAsync(x => x.ProductName.Contains(name));
                        if (dbProduct != null)
                        {
                            dbProduct.Description = fullDesc;
                            dbProduct.Material = material;
                            dbProduct.Style = style;
                            updatedCount++;
                        }
                    }
                }

                await _context.SaveChangesAsync();
                return Ok($"Updated {updatedCount} products.");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
