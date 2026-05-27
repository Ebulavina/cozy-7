# Combination — web port

A web version of the iOS game [`dmitryshliugaev/combination-game`](https://github.com/dmitryshliugaev/combination-game). All game rules, states, transitions, and mechanics from the original Swift / SpriteKit project are preserved; the UI is rebuilt from scratch with a calmer, minimalist visual language.

> Stack: **Vite 5 + React 18 + TypeScript 5 (strict) + Zustand + CSS Modules + Vitest**. No runtime CSS-in-JS, no UI kit, no SpriteKit replacement — just the DOM.

---

## How to run

```bash
npm install
npm run dev      # http://127.0.0.1:5173/
npm run build    # tsc -b && vite build → dist/
npm run preview  # serve the production bundle
npm test         # run Vitest once
npm run test:watch
```

Requires Node ≥ 20.

---

## How the game works (1-minute summary)

- 7×7 grid. You tap a column → a new cell of the current `next` type falls into the lowest empty row.
- A continuous run of length **L** where each cell's number equals **L** clears automatically.
- A cell that matches in both row and column scores **×2**.
- Gray and black cells are obstacles:
  - Removing a cell adjacent to a **gray** obstacle turns it into a random colored cell.
  - Removing a cell adjacent to a **black** obstacle turns it into a gray one (one step at a time).
- Every 10 moves a new row of obstacles is pushed in from the bottom — with exactly one colored cell so the game can keep moving.
- Game over when the entire top row is filled.

---

## What was ported, file by file

The migration plan ([`MIGRATION_PLAN.md`](MIGRATION_PLAN.md)) has the full table; here is the short version.

### Carried over to web (logic-equivalent)

| iOS file | Web equivalent |
|---|---|
| `Models/CombType.swift` | `src/entities/board/lib/cellType.ts` + `model/types.ts` |
| `Models/CombModel.swift` (data part) | `src/entities/board/model/types.ts` (`Cell`) |
| `Utilities/Array2D.swift` | `src/entities/board/lib/grid.ts` |
| `Models/Level.swift` ★ | `src/entities/board/lib/level.ts` (1:1 port — addCell, checkMatches, applyGravity, shiftUp, topLineIs*, neighbour effects) |
| `Models/Store.swift` | merged into `src/entities/game/model/gameStore.ts` |
| `Models/SceneStore.swift` | merged into `gameStore.newGame()` |
| `Views/GameScene.swift` (logic) | `src/entities/game/lib/gameLoop.ts` (async/await port of `touchesBegan`, `startGameProcess`, `createNewLine`) |
| `AppState.swift` | `src/shared/lib/storage.ts` + persistence methods on `gameStore` |
| `Utilities/Constants.swift` | `src/shared/config/constants.ts` |

### Rebuilt with a new design

| iOS file | Web replacement |
|---|---|
| `Views/MainView.swift` | `src/widgets/main-menu/ui/MainMenu.tsx` |
| `Views/GameView.swift` | `src/widgets/game-view/ui/{GameView,Board,Hud,Cell,ScorePopups,GameOverOverlay}.tsx` |
| `Views/ProgressBar/ProgressBar.swift` | `src/shared/ui/StepBar/StepBar.tsx` |
| SpriteKit scene / textures / 1.png..7.png | DOM cells with CSS Modules + pastel tokens (`src/app/styles/tokens.css`) |

### Not carried over (by design)

- **Cell sprites** (`1.png … 7.png`, `gray.png`, `black.png`) — replaced with typography (tabular numerals) over tinted backgrounds.
- **`backgroundPattern.png`** — replaced with a flat, off-white background.
- **`Localizable.strings`** — original file was empty; English strings are inlined for now (easy to swap in i18n later).
- **Xcode / Fastlane / iOS provisioning** — not relevant on the web.
- The `Dependency.shared` singleton is dropped — the store can be instantiated per test, no global state.

---

## Differences between iOS and web versions

| Topic | iOS | Web |
|---|---|---|
| Rendering | SpriteKit `SKScene` with `SKSpriteNode`s | React DOM + CSS Modules |
| Animation | `SKAction.move` / `.scale` callbacks | CSS `transition` + `transform`, with `await sleep()` between phases |
| Touch handling | `touchesBegan` with point-to-column conversion | one transparent `<button>` per column (no pixel math) |
| State container | two `ObservableObject`s + a `Dependency.shared` singleton | one `zustand` store (no singleton) |
| Persistence | `UserDefaults` (binary plist) | `localStorage` (JSON) — formats are **not** compatible; iOS saves cannot be imported |
| Lifecycle hooks | `UIApplication.willResignActive` / `didBecomeActive` | `document.visibilitychange` + `window.pagehide` |
| Step counter | `step += 0.1` with `step > 0.9` threshold (float-based) | integer `stepsSinceShift` counter with `>= 10` threshold — behaviourally identical, no float drift |
| RNG | `arc4random_uniform` (non-deterministic, not testable) | pluggable `RNG` interface — `Math.random` in prod, seeded `mulberry32` in tests |
| `+score` popup | `SKLabelNode` rising over `SKAction.move` | absolutely positioned `<span>` with CSS `@keyframes`, removed on `onAnimationEnd` |
| Adaptive layout | fixed width = `screen − 40` | responsive, `max-width: 480px`, CSS-grid with `aspect-ratio: 1` |
| Color scheme | `Environment(\.colorScheme)` switch on a single background image | `prefers-color-scheme` media query on CSS custom properties |
| Visual style | textured backgrounds, colored sprites, accent borders | flat off-white surface, pastel cells, thin dashed grid, tabular numerals |
| Sound | none in original | none here |

---

## What's in this repo (high-level)

```
src/
├── app/                # entry, root <App>, design tokens, reset
├── entities/
│   ├── board/          # grid, cell types, Level — pure domain logic
│   └── game/           # gameStore (state) + gameLoop (orchestration)
├── features/           # (room for "place-cell", "restart-game" features — currently inlined in widgets)
├── widgets/
│   ├── main-menu/      # MainMenu screen
│   └── game-view/      # Board, Cell, Hud, ScorePopups, GameOverOverlay
└── shared/
    ├── config/         # constants (board size, durations)
    ├── lib/            # rng, sleep, storage, uid
    └── ui/             # Button, StepBar
```

FSD-flavoured layout: nothing in `entities/` imports from `widgets/`; `widgets/` and `features/` are the only places UI lives.

---

## Tests

`npm test` runs:

- **`src/entities/board/lib/level.test.ts`** — 14 unit tests covering every rule from `MIGRATION_PLAN §10`: adding cells, full-column behaviour, row/column matches by length, mixed-axis ×2 promotion, gray-neighbour upgrades, black→gray downgrades, gravity, top-row predicates, and `shiftUp` invariants. The RNG is seeded to make assertions deterministic.
- **`src/entities/game/lib/gameLoop.test.ts`** — 4 integration tests covering the touch handler: cell placement, touch-lock during animations, top-line-full game over, and the 10-move shift trigger.

All 18 tests pass:

```
 Test Files  2 passed (2)
      Tests  18 passed (18)
```

---

## Known things that could be improved

These are intentional non-goals for this port, listed here for transparency:

- No sound design (matches the original, but worth noting).
- No animations for the **shift-up** event — cells reposition instantly to the new row. The iOS version animated this with `SKAction.move`; the same could be added with a small `transform` keyframe pass triggered by a `boardVersion` bump.
- No `features/` directory in use yet — the two "features" (`place-cell`, `restart-game`) are currently small enough to live inside their widgets. A natural next step if the project grows.
- No e2e test (Playwright) is committed — manual playthrough screenshots were used during development.

---

## License

Same as the source project. The iOS source lives at [github.com/dmitryshliugaev/combination-game](https://github.com/dmitryshliugaev/combination-game).
