# akash-portfolio

Personal portfolio of **Akash Prakasan Manikyam**. Built with Next.js (App Router), GSAP and WebGL, deployed on Vercel.

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build check
```

## Edit content

All text, links and data live in **`lib/content.ts`**. Change it there and every section updates.
Leave a URL as `""` to hide that link.

## Files to replace

| File | What |
|---|---|
| `public/bg.jpg` | your portrait, square 1280x1280 (currently a placeholder) |
| `public/eskf.png`, `public/radar-interference.png`, `public/kitti-perception.png` | project screenshots / plots (placeholders) |
| `public/akash-cv.pdf` | optional CV. Then set `cvUrl: "/akash-cv.pdf"` in `lib/content.ts` |

## Open TODOs

- LinkedIn URL in `lib/content.ts` (`socials`)
- Repo links for Radar Interference and KITTI projects
- KITTI metric (e.g. mAP@0.5)
- Confirm the tool used for the radar interference simulation (currently MATLAB)

## Deploy (Vercel)

1. Vercel → Add New → Project → import `akashpm1458/akash-portfolio` (framework is detected automatically).
2. For the **Ask AI** chat, add an environment variable in Project → Settings → Environment Variables:
   `GOOGLE_GENERATIVE_AI_API_KEY` = your key from https://aistudio.google.com/apikey
   (optional `GEMINI_MODEL`, default `gemini-2.5-flash`). Without it the chat shows an "offline" message.
3. Optional: set `NEXT_PUBLIC_SITE_URL` to your final domain (used for SEO tags).

Every push to `main` redeploys automatically.

## Structure

```
app/            layout (fonts, theme, SEO), page, api/chat route
components/     one file per section (NavPill, Hero, About, Skills, Projects, Experience, Contact, Footer, ChatWidget)
lib/            content.ts (all data), hashNav.ts
styles/         one stylesheet per section
```
