# Lễ Đính Hôn — Animated Digital Invitation

Premium envelope-reveal experience for **Thanh Tuyền (Annie) & Trí Dũng**, built from the existing Canva invitation design (burgundy + cream lace, original wording preserved).

## Stack

- Next.js 15 · React 19 · TypeScript · Tailwind CSS 4
- Framer Motion for cinematic envelope / reveal / scroll motion

## Run locally

```bash
cd "/Users/dungxdayyyy/Desktop/Lễ Đính Hôn"
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Experience flow

1. **Landing** — burgundy atmosphere, floating particles, closed lace envelope, “Nhấn để mở thiệp”
2. **Hover** — soft float, scale ~1.02–1.04, sparkles, golden light sweep
3. **Open** — 3D flap `rotateX(-180deg)` (700ms) → letter rises (1200ms, 200ms delay) with `cubic-bezier(0.22, 1, 0.36, 1)`
4. **Reveal** — zoom/fade into invitation; sections fade-up once on scroll
5. **Music** — floating toggle (optional). Drop an MP3 at `public/assets/music.mp3` — no autoplay

## Component architecture

```
src/
  app/                    # layout, fonts, page shell
  components/
    InvitationExperience  # stage orchestration
    EnvelopeOpening       # reusable 3D envelope sequence
    InvitationContent     # invitation sections
    RevealSection         # once-only scroll reveals
    FloatingParticles     # petals / shimmer
    MusicToggle           # opt-in audio
  lib/
    invitation-data.ts    # original Canva copy + timing
    motion.ts             # shared Framer Motion variants
```

## Assets (from Canva)

| File | Role |
|------|------|
| `public/assets/envelope-closed.png` | Closed lace envelope |
| `public/assets/envelope-open.png` | Open envelope body |
| `public/assets/lace-frame.png` | Oval lace invitation frame |
| `public/assets/peony.png` | Peony accent |
| `public/assets/music.mp3` | Optional background music (add yourself) |
| `public/assets/gallery/*` | Optional couple photos |

## Accessibility

- Honors `prefers-reduced-motion` (skips cinematic motion)
- Keyboard: Enter/Space opens, Escape skips
- Visible “Bỏ qua hoạt ảnh” control

## Performance notes

- GPU-friendly transforms (`transform`, `opacity`) only on the envelope path
- `viewport={{ once: true }}` for scroll animations
- Next.js `Image` with AVIF/WebP
- Mobile-first layout; fixed `100dvh` landing to avoid scroll jump

## Production build

```bash
npm run build
npm start
```
