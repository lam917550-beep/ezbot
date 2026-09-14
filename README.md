# Casino Mini App

Đây là bản triển khai từ toàn bộ `BUILDGAME.txt`: Telegram Mini App, SQLite, webhook, 30 game, 100 pet, admin, realtime, hiệu năng LITE/HIGH/ULTRA.

## Chạy local
1. Cài Node.js 20 LTS hoặc mới hơn.
2. `npm install`
3. Sao chép `.env.example` thành `.env` và điền `BOT_TOKEN`, `ADMIN_IDS`, `WEBAPP_URL`, `WEBHOOK_URL`, `JWT_SECRET`.
4. `npm start`
5. Mở `http://localhost:10000/health`.

## Render
Build: `npm install`
Start: `npm start`
Health: `/health`

Sau deploy, đặt `WEBAPP_URL=https://<app>.onrender.com` và `WEBHOOK_URL=https://<app>.onrender.com/webhook`. Server tự set webhook khi có đủ biến môi trường.

## Lưu ý dữ liệu
Balance được lưu dạng TEXT số nguyên và xử lý bằng BigInt để không làm tràn giới hạn INTEGER khi admin dùng `/gift` số cực lớn.

## Nội dung đặc tả
- 30 game: 30
- 100 pet: 100
- 300 cơ chế: 300
- 1000 tính năng: 1000

## Đây là bản game chạy thật, không phải mock/demo

Kết quả của 30 game được tạo và chốt ở backend (`data/gameResolvers.js`) bằng `crypto.randomInt()` của Node.js. Frontend chỉ gửi lựa chọn, số tiền và hiển thị kết quả; frontend không thể tự đặt thắng/thua.

Ví tiền được cập nhật trong SQLite bằng giao dịch DB, lịch sử cược và giao dịch được ghi lại, cùng thống kê theo game và theo người chơi. Tất cả số dư tiền dùng chuỗi + `BigInt` trong application layer để tránh giới hạn số nguyên JavaScript thông thường.

Telegram Mini App phải gửi `initData` lên backend; backend xác thực chữ ký HMAC theo cơ chế `WebAppData`. Khi chạy production, không có tài khoản dev tự động.

### Local

```bash
npm install
cp .env.example .env
npm start
```

### Render

Build: `npm install`

Start: `npm start`

Health: `/health`

ENV tối thiểu: `BOT_TOKEN`, `ADMIN_IDS`, `WEBAPP_URL`, `WEBHOOK_URL`, `JWT_SECRET`.

`DB_PATH` có thể trỏ tới persistent disk nếu muốn giữ SQLite qua các lần restart.
