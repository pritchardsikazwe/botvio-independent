# Botvio — Portable Hosting Copy

This branch is a clean, provider-neutral copy of the Botvio web application.

## What is included

- React + TypeScript application
- Vite production build
- Botvio public pages, dashboards and features
- Supabase client integration
- PWA assets
- SEO files and static assets
- MT5 Bridge EA file

## What is intentionally excluded

- Lovable project metadata
- Lovable-only build plugins
- GitHub Actions workflows
- Local `.env` secrets
- Development-only prewarm files

The application remains connected to Supabase through environment variables. **Do not put Supabase secrets into GitHub or the hosting package.**

## Requirements

- Node.js 20+ recommended
- npm 10+ or another compatible package manager
- A Supabase project containing the Botvio database/authentication

## 1. Configure environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Set:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
VITE_GA_ID=
```

Use the existing Botvio production Supabase project if you want the existing users/data. Do not create a new database unless you intentionally want a separate Botvio installation.

## 2. Install

```bash
npm install
```

## 3. Test locally

```bash
npm run dev
```

## 4. Build for production

```bash
npm run build
```

The finished website is created in:

```
dist/
```

## 5. Deploy to normal web hosting

For cPanel/Namecheap/Apache hosting:

1. Run `npm install` and `npm run build` on your computer or build server.
2. Upload the **contents of `dist/`** into the domain's `public_html` folder.
3. Keep the included `.htaccess` file.
4. Confirm the domain uses HTTPS.
5. Configure the Supabase authentication redirect URLs for the new domain.

The application is a client-side SPA, so the server must send unknown application routes back to `index.html`.

## 6. Deploy to Cloudflare Pages or similar static hosting

Use:

- Build command: `npm run build`
- Output directory: `dist`

Set the same `VITE_*` environment variables in the hosting provider.

## 7. Deploy to a VPS

Build the project and serve `dist/` with Nginx or Apache. Do not run the Vite development server as the public production server.

## Authentication

For a new domain, add the domain to the Supabase project's:

- Site URL
- Redirect URLs

Also configure Google OAuth redirect URLs if Google sign-in is enabled.

## Important

This branch is the portable hosting copy. The GitHub `main` branch remains the source/development copy.

Never commit:

- `.env`
- service-role keys
- database passwords
- private API tokens

