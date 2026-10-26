# Lim Investment

Website công ty đầu tư chứng khoán Lim Investment, ba ngôn ngữ (Tiếng Việt, English, 繁體中文).

- **Trang công khai:** Trang chủ, Về chúng tôi, Dịch vụ, Đội ngũ, Liên hệ / đặt lịch tư vấn
- **Thị trường:** VN-Index, VN30, HNX-Index, UPCoM-Index, bảng giá theo màu bảng điện, trang chi tiết mã với biểu đồ nến
- **Công cụ:** Bộ lọc cổ phiếu, Lọc theo cơ bản (FA), Lọc theo kỹ thuật (TA); điều kiện lọc nằm trên URL nên chia sẻ và lưu được
- **Phân tích:** bài viết ba ngôn ngữ, chia theo chuyên mục
- **Tài khoản khách hàng:** danh mục ủy thác (NAV, nắm giữ, báo cáo), danh mục tự theo dõi, watchlist, bộ lọc đã lưu
- **Quản trị:** bài viết, khách hàng và danh mục ủy thác, tin nhắn liên hệ

## Công nghệ

Next.js 16 (App Router, chạy trên Node.js) · React 19 · Tailwind CSS 4 · Prisma 6 (SQLite khi phát triển, MySQL trên Hostinger) · lightweight-charts · đăng nhập bằng cookie ký JWT (`jose`) và mật khẩu băm `bcryptjs`.

## Chạy trên máy

Yêu cầu Node.js 20.12 trở lên.

```bash
npm install
```

```bash
cp .env.example .env
```

Mở `.env`, điền `SESSION_SECRET` (chuỗi ngẫu nhiên dài), `ADMIN_EMAIL`, `ADMIN_PASSWORD`. Đặt `SEED_DEMO="1"` nếu muốn có khách hàng demo. Sau đó:

```bash
npm run db:push
```

```bash
npm run db:seed
```

```bash
npm run dev
```

Mở http://localhost:3000. Tài khoản admin là `ADMIN_EMAIL` / `ADMIN_PASSWORD` trong `.env`; khách hàng demo (khi bật `SEED_DEMO`) là `demo@lim.local`, mật khẩu xem trong `prisma/seed.mjs`.

## Cấu trúc

| Đường dẫn | Nội dung |
|---|---|
| `src/app/[lang]/` | Các trang, mỗi ngôn ngữ một tiền tố URL (`/vi`, `/en`, `/zh-TW`) |
| `src/app/actions/` | Server actions: đăng nhập, watchlist, danh mục, quản trị |
| `src/dictionaries/` | Toàn bộ chữ trên giao diện; `vi.ts` là bản gốc, `en.ts` và `zh-TW.ts` phải cùng cấu trúc |
| `src/lib/market/` | Dữ liệu thị trường: danh sách mã, dữ liệu mẫu, chỉ báo kỹ thuật |
| `src/lib/screener.ts` | Logic bộ lọc FA/TA |
| `src/proxy.ts` | Chuyển hướng ngôn ngữ và chặn khu vực cần đăng nhập |
| `prisma/schema.template.prisma` | Schema cơ sở dữ liệu (sửa file này, không sửa `schema.prisma`) |
| `prisma/seed.mjs` | Tạo admin đầu tiên và bài viết mẫu |

## Dữ liệu thị trường

Hiện website dùng **dữ liệu mẫu** (`MARKET_PROVIDER="mock"`), sinh cố định theo từng mã và từng ngày. Mọi trang có số liệu đều ghi rõ "Dữ liệu mẫu".

Để dùng dữ liệu thật, viết một nhà cung cấp mới (ví dụ SSI FastConnect Data) trả về cùng các hàm như `src/lib/market/mock.ts`, rồi chọn nó trong `src/lib/market/index.ts` theo `MARKET_PROVIDER`. Các trang và công cụ không cần sửa.

## Nội dung cần thay trước khi ra mắt

- Thông tin đội ngũ, địa chỉ, số điện thoại, email: `src/dictionaries/*.ts` (mục `team`, `contact`, `footer`)
- Số giấy phép của UBCKNN: `footer.license`
- Ảnh chân dung đội ngũ (hiện đang hiển thị chữ cái đầu): xem `src/app/[lang]/team/page.tsx`
- Bài viết mẫu: sửa hoặc xóa trong trang Quản trị

Hướng dẫn đưa lên GitHub và Hostinger: xem [DEPLOY.md](DEPLOY.md).
