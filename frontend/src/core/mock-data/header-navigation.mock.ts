export interface HeaderSubItem {
  label: string;
  link?: string;
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
    slug: 'interior-decoration',
    type: 'mega',
    columns: [
      {
        title: 'Đồ trang trí tường',
        items: [
          { label: 'Tranh Canvas & Poster' },
          { label: 'Gương trang trí' },
          { label: 'Đồng hồ treo tường' },
          { label: 'Macrame & Đồ đan lát' }
        ]
      },
      {
        title: 'Đồ trang trí mềm',
        items: [
          { label: 'Thảm trải sàn' },
          { label: 'Vỏ gối tựa sofa' },
          { label: 'Rèm cửa & Vải decor' }
        ]
      },
      {
        title: 'Phụ kiện điểm nhấn',
        items: [
          { label: 'Lọ hoa & Chậu cây mini' },
          { label: 'Tượng & Đồ thủ công' },
          { label: 'Khay đựng đồ đan mây' }
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
    columns: [
      {
        title: 'Cốc & Ly',
        items: [
          { label: 'Cốc gốm nặn tay' },
          { label: 'Ly thủy tinh kiểu cách' },
          { label: 'Set ấm trà' }
        ]
      },
      {
        title: 'Đồ dùng bàn ăn',
        items: [
          { label: 'Đĩa/Bát gốm sứ' },
          { label: 'Thìa, nĩa gỗ/vàng đồng' },
          { label: 'Khay gỗ decor thức ăn' }
        ]
      },
      {
        title: 'Phụ kiện vải',
        items: [
          { label: 'Khăn trải bàn vintage' },
          { label: 'Tấm lót nồi & Lót ly' },
          { label: 'Tạp dề linen' }
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
    columns: [
      {
        title: 'Loại đèn',
        items: [
          { label: 'Đèn ngủ & Đèn để bàn' },
          { label: 'Đèn cây đứng (Floor lamps)' },
          { label: 'Dây đèn LED trang trí' },
          { label: 'Đèn hoàng hôn' }
        ]
      },
      {
        title: 'Hương thơm',
        items: [
          { label: 'Nến thơm tạo hình' },
          { label: 'Sáp thơm & Tinh dầu' },
          { label: 'Đế lót nến nghệ thuật' }
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
    items: [
      { label: 'Dưới 200k' },
      { label: '200k - 500k' },
      { label: 'Trên 500k' },
      { label: 'Quà tặng tân gia' },
      { label: 'Quà sinh nhật cho nàng / cho chàng' },
      { label: 'Set quà gói sẵn (Gift sets)' },
      { label: 'Thẻ quà tặng (E-Voucher)' }
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
