# ⚡ Competitor Radar

Real-time competitor intelligence dashboard powered by the [Ninja API](https://docs.molin.ai/ninja/ninja-api).

Enter up to 3 competitor URLs, select your intelligence modules, and get structured insights about their promotions, ads, social media activity, pricing, and customer reviews — all rendered in a live dashboard.

![Competitor Radar](https://img.shields.io/badge/Powered%20by-Ninja%20API-8b5cf6?style=for-the-badge)

## What It Does

| Module | What Ninja Investigates | What You See |
|--------|------------------------|--------------|
| 🏷️ Active Promotions | Homepage banners, discount codes, flash sales, free shipping | Deal list with urgency flags, aggressiveness score |
| 📢 Ad Campaigns | Meta Ad Library for active paid campaigns | Ad count, creative types, messaging themes, duration |
| 📱 Social Media | Instagram, Facebook, TikTok activity | Post frequency, content strategy, featured products |
| 💰 Pricing & Catalog | Price ranges, new arrivals, best-sellers | Price comparison, new product list, tactics used |
| ⭐ Reputation & Reviews | Trustpilot, Google Reviews, Heureka | Rating, sentiment trend, loves vs complaints |

## Quick Start

### Prerequisites

- A [Ninja API key](https://ninja.new) (starts with `nsk_`)
- A [Vercel account](https://vercel.com) (free tier works)
- Node.js 18+ (for local development)

### Deploy to Vercel (Recommended)

1. **Fork this repository** on GitHub

2. **Go to [vercel.com/new](https://vercel.com/new)** and import your fork

3. **Add environment variable:**
   - Key: `NINJA_API_KEY`
   - Value: your API key (e.g. `nsk_abc123...`)

4. **Click Deploy** — done! Your dashboard is live.

### Run Locally

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/competitor-radar.git
cd competitor-radar

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env and add your NINJA_API_KEY

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How It Works

```
┌─────────────┐     ┌──────────────┐     ┌───────────┐
│  Dashboard  │────▶│  Next.js API │────▶│ Ninja API │
│  (Browser)  │◀────│   Routes     │◀────│           │
└─────────────┘     └──────────────┘     └───────────┘
                         │
                         │ API key stays server-side
                         │ (Vercel env vars)
```

1. You enter competitor URLs and select modules
2. The dashboard calls your Next.js API routes (`/api/scan`, `/api/result`)
3. The API routes forward requests to the Ninja API with your key (never exposed to browser)
4. Ninja browses competitor sites, ad libraries, review platforms, and social media
5. Results come back as structured JSON (via `resultSchema`)
6. The dashboard renders the data into cards, metrics, and lists

## Project Structure

```
competitor-radar/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Main page (server component)
│   │   ├── layout.tsx        # Root layout with metadata
│   │   ├── globals.css       # All styles (dark theme)
│   │   └── api/
│   │       ├── scan/route.ts   # POST - fires parallel Ninja tasks
│   │       └── result/route.ts # GET - polls task status/result
│   ├── components/
│   │   ├── Dashboard.tsx     # Main interactive UI (client component)
│   │   └── ResultCard.tsx    # Renders structured results per module
│   └── lib/
│       ├── ninja.ts          # Ninja API client (createTask, getTaskResult)
│       └── modules.ts        # Module definitions (prompts + schemas)
├── .env.example
├── next.config.js
├── package.json
└── README.md
```

## Customization

### Add a New Module

Edit `src/lib/modules.ts` and add a new entry to the `MODULES` array:

```typescript
{
  id: "my-module",
  name: "My Custom Module",
  icon: "🔬",
  description: "What this module checks",
  buildPrompt: (url: string) => `Your prompt for ${url}...`,
  resultSchema: {
    type: "object",
    properties: {
      // Define the structure you want back
    },
    required: ["field1", "field2"]
  }
}
```

Then add a renderer in `src/components/ResultCard.tsx` for your module ID.

### Change the Model

By default, tasks use the `smart` model. Edit `src/app/api/scan/route.ts` to use `fast` (cheaper) or `super-smart` (more thorough):

```typescript
const result = await createTask(prompt, mod.resultSchema, "super-smart");
```

## API Rate Limits

The Ninja API allows 10 requests per minute. With 3 competitors × 5 modules = 15 tasks, the scan route batches them within this limit. If you hit rate limits, reduce the number of modules or competitors per scan.

## Credits

Each task consumes Ninja credits. A full scan (3 competitors × 5 modules) uses approximately 15 task executions. See [Ninja pricing](https://ninja.new/pricing) for details.

## Built With

- [Next.js 15](https://nextjs.org/) — React framework
- [Ninja API](https://docs.molin.ai/ninja/ninja-api) — AI task execution
- [Vercel](https://vercel.com) — Deployment platform

## License

MIT — use it however you want.

---

Built by [Molin AI](https://molin.ai) ⚡
