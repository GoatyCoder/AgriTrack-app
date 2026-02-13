<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# AgriTrack Pro

## Run locally

**Prerequisites:** Node.js 20+

1. Install dependencies:
   ```bash
   npm install
   ```
2. Set `GEMINI_API_KEY` in `.env.local`.
3. Start dev server:
   ```bash
   npm run dev
   ```

## Build checks

```bash
npm run typecheck
npm run build
```

## Deploy on GitHub Pages

This repository now includes an automatic deploy workflow at:

- `.github/workflows/deploy-gh-pages.yml`

### Required GitHub setup

1. Go to **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Add repository secret:
   - `GEMINI_API_KEY`

### How deployment works

- On every push to `main`, GitHub Actions runs:
  - install dependencies (`npm ci`)
  - type check (`npm run typecheck`)
  - build (`npm run build`)
  - deploy `dist/` to GitHub Pages
- You can also trigger deploy manually via **Actions → Deploy to GitHub Pages → Run workflow**.

> Note: `vite.config.ts` auto-detects GitHub Actions and sets the correct `base` path using `GITHUB_REPOSITORY`.
