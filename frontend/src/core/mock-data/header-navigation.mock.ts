export interface HeaderSubItem {
  label: string;
  link?: string;
  category?: string; // Tên danh mục thực tế trong DB
}

export interface HeaderMenuColumn {
  title: string;
  items: HeaderSubItem[];
}

export interface HeaderNavCategory {
  label: string;
  slug?: string;
  type: 'mega' | 'dropdown' | 'link';
  link?: string;
  category?: string; // Tên danh mục thực tế trong DB
  columns?: HeaderMenuColumn[];
  featuredImage?: { src: string; caption: string };
  items?: HeaderSubItem[];
}

export const HEADER_NAVIGATION_STRUCTURE: HeaderNavCategory[] = [
  {
    label: 'Khuyến mại',
    slug: 'promotions',
    type: 'link',
    link: '/#flash-sale'
  },
  {
    label: 'Trang trí nội thất',
    slug: 'decor',
    type: 'mega',
    category: 'Trang trí,Trang trí tường',
    columns: [
      {
        title: 'Đồ trang trí tường',
        items: [
          { label: 'Tranh Canvas & Poster', category: 'Trang trí tường' },
          { label: 'Gương trang trí', category: 'Trang trí tường' },
          { label: 'Đồng hồ treo tường', category: 'Trang trí tường' },
          { label: 'Macrame & Đồ đan lát', category: 'Trang trí' }
        ]
      },
      {
        title: 'Đồ trang trí mềm',
        items: [
          { label: 'Thảm trải sàn', category: 'Phụ kiện vải' },
          { label: 'Vỏ gối tựa sofa', category: 'Phụ kiện vải' },
          { label: 'Rèm cửa & Vải decor', category: 'Phụ kiện vải' }
        ]
      },
      {
        title: 'Phụ kiện điểm nhấn',
        items: [
          { label: 'Lọ hoa & Chậu cây mini', category: 'Trang trí' },
          { label: 'Tượng & Đồ thủ công', category: 'Trang trí' },
          { label: 'Khay đựng đồ đan mây', category: 'Mây tre đan' }
        ]
      }
    ],
    featuredImage: {
      src: 'https://picsum.photos/id/1078/400/300',
      caption: 'Góc phòng khách ấm áp'
    }
  },
  {
    label: 'Bếp & Bàn ăn',
    slug: 'kitchen-dining',
    type: 'mega',
    category: 'Bàn ăn,Cốc ly',
    columns: [
      {
        title: 'Cốc & Ly',
        items: [
          { label: 'Cốc gốm nặn tay', category: 'Cốc ly' },
          { label: 'Ly thủy tinh kiểu cách', category: 'Cốc ly' },
          { label: 'Set ấm trà', category: 'Cốc ly' }
        ]
      },
      {
        title: 'Đồ dùng bàn ăn',
        items: [
          { label: 'Đĩa/Bát gốm sứ', category: 'Bàn ăn' },
          { label: 'Thìa, nĩa gỗ/vàng đồng', category: 'Bàn ăn' },
          { label: 'Khay gỗ decor thức ăn', category: 'Bàn ăn' }
        ]
      },
      {
        title: 'Phụ kiện vải',
        items: [
          { label: 'Khăn trải bàn vintage', category: 'Phụ kiện vải' },
          { label: 'Tấm lót nồi & Lót ly', category: 'Phụ kiện vải' },
          { label: 'Tạp dề linen', category: 'Phụ kiện vải' }
        ]
      }
    ],
    featuredImage: {
      src: 'https://picsum.photos/id/425/400/300',
      caption: 'Bữa ăn ngon hơn'
    }
  },
  {
    label: 'Đèn & Ánh sáng',
    slug: 'lighting',
    type: 'mega',
    category: 'Đèn,Hương thơm',
    columns: [
      {
        title: 'Loại đèn',
        items: [
          { label: 'Đèn ngủ & Đèn để bàn', category: 'Đèn' },
          { label: 'Đèn cây đứng (Floor lamps)', category: 'Đèn' },
          { label: 'Dây đèn LED trang trí', category: 'Đèn' },
          { label: 'Đèn hoàng hôn', category: 'Đèn' }
        ]
      },
      {
        title: 'Hương thơm',
        items: [
          { label: 'Nến thơm tạo hình', category: 'Hương thơm' },
          { label: 'Sáp thơm & Tinh dầu', category: 'Hương thơm' },
          { label: 'Đế lót nến nghệ thuật', category: 'Hương thơm' }
        ]
      }
    ],
    featuredImage: {
      src: 'https://picsum.photos/id/366/400/300',
      caption: 'Ánh sáng cực chill'
    }
  },
  {
    label: 'Quà tặng',
    slug: 'gifts',
    type: 'dropdown',
    category: 'Trang trí',
    items: [
      { label: 'Dưới 200k', category: 'Trang trí' },
      { label: '200k - 500k', category: 'Trang trí' },
      { label: 'Trên 500k', category: 'Trang trí' },
      { label: 'Quà tặng tân gia', category: 'Trang trí' },
      { label: 'Quà sinh nhật cho nàng / cho chàng', category: 'Trang trí' },
      { label: 'Set quà gói sẵn (Gift sets)', category: 'Trang trí' },
      { label: 'Thẻ quà tặng (E-Voucher)', category: 'Trang trí' }
    ]
  },
  {
    label: 'Thương hiệu',
    slug: 'brands',
    type: 'dropdown',
    items: [
      { label: 'Gốm Bát Tràng' },
      { label: 'Thơm Studio' },
      { label: 'Lạc Macrame' },
      { label: 'Mây Tre Đan' }
    ]
  },
  {
    label: 'Nhà thiết kế',
    slug: 'designers',
    type: 'dropdown',
    items: [
      { label: 'BST "Thu Cúc" x Họa sĩ A' },
      { label: 'BST "Mùa Yêu" x Designer B' }
    ]
  },
  {
    label: 'Liên hệ',
    slug: 'contact',
    type: 'link',
    link: '/contact'
  },
  {
    label: 'Blog',
    slug: 'blog',
    type: 'dropdown',
    items: [
      { label: 'Mẹo trang trí nhà cửa' },
      { label: 'Xu hướng không gian sống' },
      { label: 'Chuyện nhà Bee' },
      { label: 'Video & Lookbook' }
    ]
  },
  {
    label: 'B2B',
    slug: 'b2b',
    type: 'dropdown',
    items: [
      { label: 'Chính sách mua sỉ (Đại lý)' },
      { label: 'Quà tặng sự kiện / Quà tặng nhân viên' },
      { label: 'Đăng ký báo giá doanh nghiệp' },
      { label: 'Dự án đã thực hiện (Portfolio)' }
    ]
  }
];
