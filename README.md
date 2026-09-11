# HEALTHCONNECT - Hệ Thống Đặt Lịch Khám Bệnh Trực Tuyến

Website đặt lịch khám bệnh trực tuyến kết nối bệnh nhân và bác sĩ chuyên khoa, hỗ trợ quản lý lịch khám theo thời gian thực.

- **Production URL**: [https://dat-lich-kham-benh.vercel.app](https://dat-lich-kham-benh.vercel.app)
- **Repository**: [https://github.com/HIEPVO212/dat-lich-kham-benh](https://github.com/HIEPVO212/dat-lich-kham-benh)

---

## 1. Công nghệ sử dụng
- **Frontend Framework**: Next.js 16 (App Router), React 19, TypeScript.
- **UI Library & Styling**: Ant Design (AntD) 5, Tailwind CSS.
- **State Management**: React Context API (`AuthContext`) quản lý phiên đăng nhập và profile toàn cục.
- **Backend & Database**: Supabase (PostgreSQL), Supabase Auth (JWT), Row Level Security (RLS).
- **Storage**: Supabase Storage (`avatars` bucket) hỗ trợ upload ảnh đại diện.
- **Deployment**: Vercel CI/CD Pipeline.

---

## 2. Hướng dẫn cài đặt & Chạy cục bộ
```bash
# 1. Clone repository
git clone https://github.com/HIEPVO212/dat-lich-kham-benh.git
cd dat-lich-kham-benh

# 2. Cài đặt thư viện phụ thuộc
npm install

# 3. Tạo file biến môi trường .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# 4. Chạy môi trường development
npm run dev