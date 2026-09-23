# Qysqa — Link Cleaner + Shortener

Qysqa cleans tracking parameters from long URLs, lets you choose a custom slug, creates a real short link, and generates a QR code.

## Features
- Removes common tracking parameters (`utm_*`, `fbclid`, `gclid`, etc.)
- Shows how much shorter/cleaner the URL became
- Custom slug or auto-generated slug
- Real redirect links stored in Cloudflare KV
- QR code for the shortened URL
- Basic destination preview (host + HTTPS status)
- No login required for MVP

## Local setup
1. Install Node.js 18+
2. Run `npm install`
3. Login: `npx wrangler login`
4. Create KV: `npx wrangler kv namespace create LINKS`
5. Copy the returned namespace `id` into `wrangler.toml`
6. Run `npm run dev`

## Deploy
Run:

```bash
npm run deploy
```

After deployment, Cloudflare gives you a free `*.workers.dev` address.

## Important
This is an MVP. Public deployments should add rate limiting / abuse prevention before heavy public use.
