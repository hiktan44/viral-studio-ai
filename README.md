# ViralStudio AI

AI-powered content generation platform. Create stunning videos, images, avatars, and audio content with AI agents — zero editing skills required.

## Features

### Agent (Video Agent)
- Chat-based AI video production with scene planning
- @mention system for referencing uploaded assets
- Multi-scene chaining up to 10 minutes
- Timeline editor with clip management
- Model selection: Seedance 2.0, Wan, Kling

### Board (Storyboard to Video)
- Text-to-storyboard generation
- Reference image support (up to 16 images)
- Configurable frame count (4/9/25/custom)
- Camera motion controls per frame
- One-click video generation from storyboard

### Image Module (8 Tools)
- **Text to Image** — Flux, SDXL, DALL-E 3 models
- **Image Edit** — Natural language editing
- **Inpainting** — Brush-based mask editing
- **Character Swap** — Style transfer
- **Face Swap** — Multi-face support
- **Upscale** — 2x/4x with AI sharpening
- **Virtual Try-On** — Product on model
- **Product Photography** — Scene backgrounds

### Video Module (5 Tools)
- **Image to Video** — Motion from still images
- **Text to Video** — Direct generation
- **Omni Reference** — Multi-reference SEEDANCE2
- **Video Upscale** — Resolution enhancement
- **Motion Control** — Vector-based motion

### Avatar Module (3 Tools)
- **AI Avatar** — 50+ ready avatars with script input
- **Product Avatar** — Product showcase presentations
- **Lip Sync** — Audio-driven lip synchronization

### Audio Module (2 Tools)
- **Text to Speech** — 100+ voices, multi-language
- **Voice Clone** — Instant voice cloning from 10s sample

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **State:** Zustand
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Language:** TypeScript

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Credit System

| Action | Credits |
|--------|---------|
| Image to Video (5s) | 5 |
| Text to Image | 1 |
| TTS (1000 chars) | 1 |
| AI Avatar (30s) | 10 |
| Video Upscale | 8 |
| Voice Clone | 5 |
| Agent Generate | 15 |

**Plans:** Free (20/mo) · Pro ($29/500/mo) · Unlimited ($79/mo)

## Project Structure

```
src/
├── app/
│   ├── agent/          # Video Agent pages
│   ├── board/          # Storyboard pages
│   ├── image/          # Image tools (8 pages)
│   ├── video/          # Video tools (5 pages)
│   ├── avatar/         # Avatar tools (3 pages)
│   ├── audio/          # Audio tools (2 pages)
│   └── pricing/        # Pricing page
├── components/
│   ├── layout/         # Sidebar, TopBar
│   └── ui/             # shadcn/ui components
├── store/              # Zustand state management
└── lib/                # Utilities
```

## License

MIT
