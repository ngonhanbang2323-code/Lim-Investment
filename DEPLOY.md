# Đưa Lim Investment lên GitHub và Hostinger

Website là ứng dụng Node.js (Next.js) có cơ sở dữ liệu, nên cần gói Hostinger có hỗ trợ **Node.js Web Apps** (Business, Cloud) hoặc VPS. Gói Premium/Single không chạy được.

Tên menu trong hPanel có thể thay đổi theo thời gian. Nếu không thấy đúng tên dưới đây, tìm mục có chữ "Node.js".

## 1. Đưa mã nguồn lên GitHub

1. Tạo repository mới trên GitHub, ví dụ `lim-investment`. Nên để **Private**.
2. Trong thư mục `lim-investment`, chạy (thay `TEN-CUA-BAN` bằng tài khoản GitHub của bạn):

```bash
git remote add origin https://github.com/TEN-CUA-BAN/lim-investment.git
```

```bash
git push -u origin main
```

File `.env` (chứa mật khẩu và khóa bí mật) đã nằm trong `.gitignore` nên **không** bị đẩy lên GitHub.

## 2. Tạo cơ sở dữ liệu MySQL trên Hostinger

1. hPanel → **Databases** → **MySQL Databases**.
2. Tạo database, user và mật khẩu. Ghi lại tên database, tên user, mật khẩu và **host** mà hPanel hiển thị.
3. Ghép thành chuỗi kết nối:

```
mysql://USER:MAT_KHAU@HOST:3306/TEN_DATABASE
```

Nếu mật khẩu có ký tự đặc biệt như `@ : / ? #`, cần mã hóa URL (ví dụ `@` thành `%40`).

## 3. Tạo ứng dụng Node.js

1. hPanel → **Websites** → **Add website** → chọn **Node.js Apps**.
2. Chọn **Import Git repository**, kết nối GitHub và chọn repo `lim-investment`, nhánh `main`.
3. Cấu hình build:
   - Framework: **Next.js**
   - Node.js version: **22** hoặc mới hơn
   - Build command: `npm run build`
   - Start command: `npm start`
4. Thêm **Environment variables**:

| Tên | Giá trị |
|---|---|
| `DATABASE_URL` | chuỗi `mysql://…` ở bước 2 |
| `SESSION_SECRET` | chuỗi ngẫu nhiên dài, tạo bằng lệnh bên dưới |
| `SITE_URL` | `https://ten-mien-cua-ban.com` |
| `MARKET_PROVIDER` | `mock` |
| `ADMIN_EMAIL` | email admin đầu tiên |
| `ADMIN_PASSWORD` | mật khẩu admin đầu tiên, ít nhất 10 ký tự |

Tạo `SESSION_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

**Không** đặt `SEED_DEMO` trên Hostinger.

5. Bấm **Deploy**.

Lệnh `npm run build` tự làm theo thứ tự:
1. Tạo schema cho MySQL.
2. Tạo bảng trong database.
3. Tạo tài khoản admin đầu tiên và 4 bài viết mẫu, nếu chưa có.
4. Build website.

Lần deploy sau không ghi đè dữ liệu đã có.

## 4. Sau khi deploy

1. Gắn tên miền và bật SSL trong hPanel.
2. Đăng nhập tại `https://ten-mien-cua-ban.com/vi/login` bằng `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
3. Đổi nội dung mẫu: đội ngũ, địa chỉ, số giấy phép, bài viết (xem README.md).

## Cập nhật website

Sửa code → commit → `git push`. Nếu bật auto-deploy, Hostinger tự build lại; nếu không, bấm **Redeploy** trong hPanel.

## Lưu ý về thay đổi cơ sở dữ liệu

Khi sửa `prisma/schema.template.prisma`, bước build chạy `prisma db push`. Bước này **từ chối** những thay đổi làm mất dữ liệu (xóa cột, xóa bảng), nên deploy sẽ báo lỗi thay vì xóa dữ liệu. Với những thay đổi như vậy, hãy sao lưu database trước rồi xử lý thủ công.

## Sao lưu

Bật sao lưu tự động trong hPanel (**Files** → **Backups**). Database chứa tài khoản khách hàng, NAV và tin nhắn liên hệ, nên cần sao lưu định kỳ.
