# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install      # Install dependencies (required before first run)
npm run dev      # Start dev server at http://localhost:3000 (opens automatically)
npm run build    # Build to build/ directory
```

No test runner is configured — there are no tests in the project.

## Architecture

- Single-file React SPA — all game logic lives in `src/App.tsx`
- `src/components/ui/` — pre-built Radix UI + Tailwind wrappers; most are unused by the current game

### Game logic (`src/App.tsx`)

**State & types**
- `Box` — `{ id, isOpen, hasTreasure }`
- `boxes: Box[]` — array of 3 chests
- `score: number` — current score
- `gameEnded: boolean` — controls game-over view

**Functions**
- `initializeGame()` — creates 3 boxes, randomly assigns treasure to one
- `openBox(id)` — +$100 for treasure / -$50 for skeleton; sets `gameEnded` when treasure found or all boxes opened
- `resetGame()` — calls `initializeGame()` to restart

**Runtime behaviour**
- Animations — `motion` library (not Framer Motion directly)
- Audio — `new Audio(...)` inline; `chest_open.mp3` for treasure, `chest_open_with_evil_laugh.mp3` for skeleton

### Styling

- Tailwind utility classes; amber palette for game theme
- Design tokens (colors, dark mode) — `src/styles/globals.css` (OKLch color space)
- `src/index.css` — generated Tailwind file, do not edit manually
- `cn()` — `src/components/ui/utils.ts`, combines `clsx` + `tailwind-merge`

### Path alias & assets

- `@` → `./src` (configured in `vite.config.ts`)
- Images — `src/assets/`: `treasure_closed.png`, `treasure_opened.png`, `treasure_opened_skeleton.png`, `key.png`
- Audio — `src/audios/`: `chest_open.mp3`, `chest_open_with_evil_laugh.mp3`

## Conventions

- Every new function must have a one-line comment at the top summarizing its purpose, inputs, and outputs.

## Custom commands

Slash commands can be added as Markdown files in `.claude/commands/`. Re-open the Claude Code session after creating a new command file for it to be recognized.
