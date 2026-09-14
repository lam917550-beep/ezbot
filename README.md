# Casino Mini App — xu ảo

Telegram Mini App casino sử dụng xu ảo, Express, Telegraf, Socket.IO và SQLite.

## Chạy local
1. `npm install`
2. Sao chép `.env.example` thành `.env` và điền biến môi trường.
3. `npm start`
4. Mở `/health` để kiểm tra.

## Render
- Build: `npm install`
- Start: `npm start`
- Health: `/health`
- `WEBAPP_URL` là URL HTTPS của service.
- `WEBHOOK_URL` là `${WEBAPP_URL}/webhook`.

## Lưu ý dữ liệu
SQLite trên môi trường không có persistent disk có thể mất dữ liệu sau redeploy/restart. Dùng Render Disk hoặc PostgreSQL nếu cần lưu trữ lâu dài.

## Phạm vi bản phát hành này
Đây là bản triển khai thật cho lõi economy, auth, bot, 30 game, pet seed, admin, leaderboard, chat và UI nền. Không tuyên bố rằng toàn bộ 1000 tính năng danh sách đã được triển khai, vì điều đó cần nhiều module độc lập và kiểm thử thực tế hơn.
