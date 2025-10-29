Minimal Next.js frontend for RAF using a black/white/dark-green theme.

## Run locally

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```
2. Start dev server:
   ```bash
   npm run dev
   ```
3. Production build:
   ```bash
   npm run build && npm start
   ```

Optional: configure API base URL (defaults to http://localhost:8000/api/v1)

- Create a `.env.local` with:
  ```bash
  NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
  ```

## Structure

- `app/` – App Router pages (`/`, `/about`, `/login`)
- `app/globals.css` – global styles and theme tokens
- `components/` – shared UI (header, footer)

## Theme

- Primary accent: dark green (`--accent: #0b3d2e`)
- Neutral: black/white with subtle grays


