# Đặt lịch khám bệnh

Ứng dụng Next.js kết nối với Supabase và triển khai trên Vercel.

## Cấu hình biến môi trường

Ứng dụng bắt buộc có hai biến môi trường:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Chạy local

1. Sao chép `.env.example` thành `.env.local`.
2. Mở Supabase Dashboard → **Project Settings** → **API**.
3. Điền `Project URL` vào `NEXT_PUBLIC_SUPABASE_URL`.
4. Điền key **anon / publishable** vào `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
5. Khởi động lại Next.js bằng `npm run dev`.

Không dùng `service_role` key ở trình duyệt và không commit file `.env.local`.

### Cấu hình trên Vercel

Vào **Vercel Project → Settings → Environment Variables**, tạo cả hai biến trên cho các môi trường cần deploy (**Production**, **Preview** và/hoặc **Development**). Sau đó tạo một deployment mới hoặc chọn **Redeploy** để biến môi trường được áp dụng.

Sau khi cấu hình xong, lỗi `supabaseUrl is required` sẽ không còn xuất hiện.

## Chạy dự án

```bash
npm install
npm run dev
```

Kiểm tra bản production:

```bash
npm run build
```
