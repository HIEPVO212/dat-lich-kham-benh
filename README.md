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
```

## 3. Kiểm tra chất lượng

```bash
npm run typecheck
npm test
npm run build
npm run lint
```

CI chạy tự động typecheck, unit test và production build trên mỗi push hoặc pull request vào `main`. Workflow nằm tại `.github/workflows/ci.yml`.

## 4. Cấu hình Supabase

Chạy các migration trong `supabase/migrations/` theo thứ tự ngày tháng trong Supabase SQL Editor. Các migration chính:

- RLS cho lịch hẹn và quyền admin.
- RLS đọc danh mục bác sĩ, chuyên khoa và cơ sở.
- Các cột `reason` và `specialty` cho lịch hẹn.
- Khóa ngoại `appointments.patient_id` tới `auth.users(id)` và policy đặt lịch cho user.

Không commit `.env.local`, anon key riêng hoặc service-role key vào Git.

## 5. Giải trình lựa chọn công nghệ

### 5.1 Framework

Ứng dụng dùng Next.js 16.3.3 với App Router và React 19. Next.js phù hợp vì có routing theo thư mục, prerendering cho trang nội dung và hỗ trợ API route trong cùng project. Phương án thay thế là Vite + React: Vite nhẹ cho SPA nhưng cần tự ghép routing, API và cấu hình deploy. Hạn chế đã gặp là các trang dùng `useSearchParams` phải được bọc `Suspense` để build production.

### 5.2 Thư viện UI và state

Ant Design cung cấp Form, Select, Table, Modal, Upload, Tag và các trạng thái loading/error; Tailwind CSS dùng cho layout và responsive styling. React Context (`AuthContext`) giữ session/profile dùng chung, còn state cục bộ giữ form, lịch hẹn và bộ lọc. Cách này phù hợp hơn Redux cho quy mô hiện tại, nhưng khi nghiệp vụ tăng mạnh có thể cần một store chuyên dụng.

### 5.3 Database

Supabase PostgreSQL được chọn vì là SQL database phù hợp với quan hệ user, bác sĩ, chuyên khoa và appointment; có Auth JWT, Storage và Row Level Security. `doctor_id` liên kết catalog bác sĩ, `patient_id` liên kết `auth.users`, còn policy giới hạn user chỉ đọc/sửa lịch của mình và admin quản lý toàn bộ. Supabase JS là driver/data access layer.

### 5.4 Demo và nghiệp vụ

Luồng demo: đăng nhập/đăng ký → chọn chuyên khoa → chọn bác sĩ → chọn ngày và slot còn trống → nhập lý do khám → đặt lịch → admin duyệt → người dùng theo dõi trạng thái. Admin có thêm quản lý bác sĩ, tài khoản và role `user/member/admin`.

### 5.5 Câu hỏi bảo vệ nên chuẩn bị

- Vì sao `patient_id` dùng `auth.users(id)` và RLS kiểm tra `auth.uid()`?
- Vì sao cần kiểm tra slot ở client nhưng vẫn phải dùng RLS/database ở server?
- Vì sao dùng Ant Design cùng Tailwind, và mỗi thư viện đảm nhận phần nào?
- Vì sao không lưu secret key ở frontend?
- Khi deploy, các biến `NEXT_PUBLIC_SUPABASE_URL` và `NEXT_PUBLIC_SUPABASE_ANON_KEY` được cấu hình ở đâu?

## 6. Đối chiếu phiếu chấm

| Mục | Trạng thái hiện tại | Bằng chứng |
| --- | --- | --- |
| React/Next.js | Đạt nền tảng | Next.js 16 App Router, React 19 |
| UI | Đạt nền tảng | Ant Design + Tailwind |
| State/client storage | Đạt nền tảng | `AuthContext`, React state, Supabase session |
| JWT & phân quyền | Đạt nền tảng | Supabase Auth, RLS, admin guard |
| Upload file | Có | Avatar upload qua Supabase Storage |
| Database/API | Có | PostgreSQL/Supabase, API doctors, migrations |
| Nghiệp vụ | Có | Booking, slot, cancel, admin approve, role management |
| Deploy online | Có URL cần kiểm tra khi bảo vệ | Vercel URL ở đầu tài liệu |
| Code/Git/tài liệu | Đã bổ sung | TypeScript, CI, README, migration |
| Test | Đã bổ sung unit test | `npm test` |
| CI/CD | Đã bổ sung CI | `.github/workflows/ci.yml` |
| Docker/Nginx | Chưa có | Có thể bổ sung nếu thầy yêu cầu bắt buộc |
| Performance số liệu | Chưa có số đo commit | Cần chạy Lighthouse và lưu kết quả |
| Accessibility | Đang cải thiện | `lang="vi"`, label Form, button aria-label |