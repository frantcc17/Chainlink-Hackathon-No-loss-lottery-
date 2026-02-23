# LuckYield — Web3 Raffle Protocol MVP

> No-loss yield raffles built for the Chainlink Hackathon. Frontend-only MVP with full Web3-ready architecture.

## 🚀 Quick Start

```bash
npm install
npm run dev
# → http://localhost:3000
```

## 📦 Dependency Versions (Feb 2026)

| Package | Version | Notes |
|---|---|---|
| `next` | ^16.1.0 | Dec 2025 — Turbopack stable, React 19.2 |
| `react` / `react-dom` | ^19.1.0 | React 19 stable — new compiler support |
| `zustand` | ^5.0.11 | v5 — `useSyncExternalStore`, curried `create<T>()` |
| `tailwindcss` | ^4.1.3 | v4 — CSS-first config, no `tailwind.config.ts` |
| `@tailwindcss/postcss` | ^4.1.3 | v4 replaces old `tailwindcss` postcss plugin |
| `@radix-ui/react-dialog` | ^1.1.15 | React 19 peer dep support |
| `@radix-ui/react-tabs` | ^1.1.13 | React 19 peer dep support |
| `lucide-react` | ^0.475.0 | Latest icon set |
| `typescript` | ^5.8.3 | Latest TS |
| `@types/react` | ^19 | React 19 types |

## ⚠️ Breaking Changes Applied

### Tailwind v4
- `tailwind.config.ts` **removed** — config lives entirely in `globals.css` via `@theme {}`
- `postcss.config.js` uses `@tailwindcss/postcss` instead of `tailwindcss`
- Colors accessed as CSS variables: `bg-[var(--color-accent)]` or via `@theme` tokens
- No `autoprefixer` needed — Tailwind v4 handles it internally
- `@import "tailwindcss"` replaces the three `@tailwind base/components/utilities` directives

### Zustand v5
- `create` is now always **curried**: `create<State>()((set, get) => ...)`
- Uses `useSyncExternalStore` internally for React 18/19 concurrent mode compatibility
- `persist` middleware `merge` generic tightened — uses `PersistOptions<State, Persisted>`

### React 19
- `React.ElementRef` → `React.ComponentRef` (ElementRef is deprecated)
- No need to `import React from 'react'` for JSX — automatic JSX transform
- `useEffectEvent` and View Transitions available (not used in MVP, reserved for future)

### Next.js 16
- Turbopack is now **default** for both `next dev` and `next build`
- `params` and `searchParams` in pages are now async (updated in page components)
- Multiple security CVEs patched vs 14.x — **upgrade is critical**

## 🐛 Debug Mode

```
http://localhost:3000/dashboard?debug=1
```

🐛 button in bottom-right → "Finalize raffle (demo)" + "+50 USDC"

## 📁 Project Structure

```
├── app/
│   ├── layout.tsx             # Root layout
│   ├── globals.css            # Tailwind v4 @theme config + design tokens
│   ├── page.tsx               # Login page
│   └── dashboard/page.tsx     # Dashboard
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Dialog.tsx         # Radix Dialog 1.1.15
│   │   ├── Tabs.tsx           # Radix Tabs 1.1.13
│   │   ├── Badge.tsx
│   │   └── Countdown.tsx
│   ├── dashboard/
│   │   ├── DashboardHeader.tsx
│   │   ├── FeaturedRaffleCard.tsx
│   │   ├── RafflesList.tsx
│   │   ├── MyRaffles.tsx
│   │   ├── HowItWorks.tsx
│   │   └── DebugPanel.tsx
│   └── modals/
│       ├── BuyEntriesModal.tsx
│       └── ResultModal.tsx
├── stores/
│   ├── userStore.ts           # Zustand v5 + persist
│   ├── raffleStore.ts         # Zustand v5 + persist
│   └── uiStore.ts
└── utils/index.ts
```

## 🔗 Web3 Integration Points

Search `// TODO:` comments for Chainlink integration spots:

| File | Integration |
|---|---|
| `stores/raffleStore.ts` | Fetch raffles from smart contract |
| `BuyEntriesModal.tsx` | `wagmi` `writeContract` — USDC approve + buyTickets |
| `ResultModal.tsx` | Chainlink VRF randomness proof link |
| `FeaturedRaffleCard.tsx` | Real pool size from contract events |
| `DebugPanel.tsx` | Trigger Chainlink Automation keeper |
