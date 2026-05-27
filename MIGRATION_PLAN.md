# MIGRATION_PLAN.md — Combination: iOS (Swift/SwiftUI + SpriteKit) → Web (React + TS + Vite)

Источник: [`dmitryshliugaev/combination-game`](https://github.com/dmitryshliugaev/combination-game) (Swift 5, SwiftUI + SpriteKit, ~1 088 LOC).
Цель: воспроизвести **всю** игровую логику, состояния, правила, переходы и механику в Web, но с новым минималистичным UI. Игровой движок (SpriteKit) заменяем на чистый React + CSS (без runtime CSS-in-JS), бизнес-правила выносим в фреймворк-независимые TS-модули.

---

## 1. Карта файлов и категоризация

| Файл iOS | LOC | Категория | Что делать при миграции |
|---|---|---|---|
| `CombinationApp.swift` | 28 | **platform** (SwiftUI App entry, NotificationCenter для background/foreground) | Эквивалент — `main.tsx` + `document.visibilitychange` слушатель |
| `AppState.swift` | 36 | **platform** (UserDefaults persistence) | Заменить на `localStorage` через `shared/lib/storage.ts` |
| `Dependency.swift` | 22 | **domain glue** (singleton-DI: Store + Level) | Перенести как фабрику стора (zustand) без глобального singleton; в тестах создаётся новый стор |
| `Models/CombModel.swift` | 60 | **domain logic** (модель ячейки) + `SKSpriteNode` ссылка — **platform tail** | Чистый TS-тип `Cell { type: CellType; id: string }`. Sprite-узел больше не нужен — React сам рендерит по координатам в стейте |
| `Models/CombType.swift` | 43 | **domain logic** (enum 1..7/gray/black + RNG) | TS-enum + `randomCellType()`, `randomColored()`, `randomObstacle()` |
| `Models/Level.swift` | 221 | **domain logic** ★ ключевой файл | 1:1 порт в `entities/board/lib/level.ts` — чистые функции/класс без UI зависимостей |
| `Models/SceneStore.swift` | 31 | **platform** (хранит GameScene, restart) | Не нужен в Web — `restart()` живёт в gameStore |
| `Models/Store.swift` | 60 | **domain state** (score, step, isGameOver, next type) + Codable | Перенести в `entities/game/model/gameStore.ts` (zustand с persist middleware) |
| `Utilities/Array2D.swift` | 27 | **domain logic** (плоский массив 2D) | TS-класс `Grid<T>` или просто `readonly (Cell\|null)[][]` + хелперы |
| `Utilities/Constants.swift` | 28 | **shared** (numColumns=7, numRows=7, длительности анимаций) | `shared/config/constants.ts` |
| `Views/GameScene.swift` | 220 | **UI** + **domain orchestrator** (SpriteKit, touch handling, animations, side-effects) | Логика игрового цикла (`startGameProcess`, `createNewLine`, score) → `entities/game/lib/gameLoop.ts`; SpriteKit/анимации → CSS transitions + React state |
| `Views/GameView.swift` | 89 | **UI** | Заменить полностью — `widgets/game-view` |
| `Views/MainView.swift` | 87 | **UI** (главное меню, Resume/New) | `widgets/main-menu` |
| `Views/ProgressBar/ProgressBar.swift` | 53 | **UI** | `shared/ui/StepBar` (10 ячеек, индикатор «10 ходов до новой строки») |
| `Extensions/String+Localization.swift` | 14 | **helpers** | Можно опустить — UI текст инлайнится; при желании — i18n позже |
| `Resources/Assets.xcassets/Icons/{1..7,gray,black}.png` | — | **assets** | **Не переносим.** Новый UI рендерит ячейки как круги/квадраты с цифрой и приглушённым цветом из нейтральной палитры. Изображения нужны не были — это просто цифры |
| `Resources/Assets.xcassets/backgroundPattern.png` | — | **assets** | **Отбрасываем.** Новый дизайн использует ровный нейтральный фон |
| `Resources/Assets.xcassets/Colors/ProgressBar*.colorset` | — | **assets** | Заменяем на CSS-переменные |
| `CombinationTests/LevelTests.swift` | 88 | **tests** | Шаблоны портируем в Vitest, расширяем настоящими ассертами для каждой механики |
| `CombinationTests/CombinationTests.swift` | 35 | **tests (legacy)** | Игнор / выкидываем |
| `Info.plist`, `Combination.xcodeproj`, `fastlane/*` | — | **platform-build** | Не переносим, заменяем на `vite.config.ts` + `package.json` |

★ — критический файл, требующий 1:1 порта.

**Итог:** из ~1 088 строк Swift к переносу в TS уходит ~470 строк чистой domain-логики (`Level.swift` + `CombModel/Type` + `Store` + `Array2D` + `Constants` + `AppState`). Остальное — UI и платформа, переписывается заново.

---

## 2. Игровая модель (выжимка правил)

### Поле
- Сетка **7×7** (`numColumns = numRows = 7`).
- Каждая клетка — либо `null`, либо ячейка с типом:
  - `1..7` — «цветные» ячейки с числом;
  - `gray` — серое препятствие;
  - `black` — чёрное препятствие.

### Что делает игрок
1. Тапает по **колонке** (не по клетке) → создаётся ячейка типа `store.nextType` и падает на самую нижнюю свободную строку этой колонки (`Level.addComb`).
2. После приземления `store.nextType` перегенерируется случайно из всех 9 типов (`CombType.random()`).
3. Если колонка полностью занята и весь верхний ряд тоже занят — **Game Over**.

### Что происходит автоматически после хода
4. Вызывается `checkCombinationsInMatrix()`:
   - Для каждой непрерывной горизонтальной группы ячеек длиной `L` — все ячейки внутри неё с типом `= L` помечаются на удаление (множитель ×1).
   - Аналогично по вертикалям. Если ячейка уже была в горизонтальном совпадении, множитель повышается до **×2**.
   - Каждое удаление вызывает `checkGrayElement(col,row)`:
     - Все 4-соседние `gray` → превращаются в случайный цветной (1..7).
     - Все 4-соседние `black` → превращаются в `gray`.
5. `elementsCheckToMoveDown()` — гравитация: пустые места схлопываются, ячейки выше падают вниз.
6. Цикл `startGameProcess` рекурсивно повторяется, пока не останется совпадений. На каждой итерации `iterationScoreMultiplier += 1` (т.е. длинные цепочки дают каскадный бонус). После завершения цикла мультипликатор сбрасывается в `1`.
7. Очки за каждое удаление: `iterationScoreMultiplier * scoreMultiplier(1 или 2)`.

### Шаг и «новая строка снизу»
8. После каждого хода `store.step += 0.1`. Когда `step > 0.9` (т.е. через **10 ходов**):
   - `step` сбрасывается в 0.
   - Через 0.7 с (`Constants.Scene.longDuration`) вызывается `createNewLine`:
     - Если верхний ряд **пустой** → `Level.shiftUp()`: всё содержимое сдвигается на 1 ряд вверх, а в нижний ряд вставляются ячейки типа `randomOnlyGrayOrBlack()` (т.е. серые/чёрные), за исключением одной случайной колонки, куда вставляется обычный цветной (1..7).
     - Если верхний ряд **не пустой** → Game Over.
   - После shiftUp снова крутится `startGameProcess` (новые препятствия могут породить совпадения).

### Сохранение / восстановление
9. При сворачивании приложения (`willResignActive`) — JSON-encode `combMatrix` и `store` в `UserDefaults`.
10. При активации (`didBecomeActive`) — восстанавливается состояние. Web-эквивалент: `localStorage` + `visibilitychange`/`beforeunload`.

### Game Over
- При попытке поставить ячейку в полностью заполненную колонку **и** верхний ряд полон.
- При попытке `createNewLine`, если верхний ряд не пуст.

---

## 3. Экраны и переходы

```
┌──────────────┐  Resume       ┌──────────────┐
│  MainMenu    │ ────────────▶ │   GameView   │
│              │  New Game     │              │
│  Resume      │ ────────────▶ │  (board, HUD)│
│  New Game    │               │              │
│  v1.0 (1)    │ ◀──────────── │  GameOver→   │
└──────────────┘   navigateBack│  Retry       │
                               └──────────────┘
```

| Экран | iOS | Web (новый) | Состояние |
|---|---|---|---|
| Главное меню | `MainView` | `widgets/main-menu` | router state |
| Игра | `GameView` + `GameScene` | `widgets/game-view` + `entities/game` + `entities/board` | gameStore + boardStore |
| Game Over | inline в `GameView` (через `store.isGameOver`) | inline overlay в `widgets/game-view` | gameStore.isGameOver |

Роутинг: `react-router` (`/`, `/play`) или просто условный рендер по `route` в zustand. Я выберу **простой условный рендер** — проект из 2 экранов, лишний роутер не нужен.

---

## 4. Целевая FSD-структура

```
src/
├── app/                      # инициализация приложения
│   ├── App.tsx               # роутинг между MainMenu / GameView
│   ├── providers.tsx         # тема, persistence-bootstrap
│   └── styles/
│       ├── reset.css
│       └── tokens.css        # CSS-переменные: цвета, типографика, тайминги
├── entities/
│   ├── board/                # сетка и правила матча
│   │   ├── lib/
│   │   │   ├── grid.ts             # Array2D-эквивалент
│   │   │   ├── level.ts            # Level: addCell, checkMatches, gravity, shiftUp, обработка gray/black
│   │   │   └── randomCellType.ts
│   │   └── model/
│   │       └── types.ts            # Cell, CellType, MatchResult, MoveResult
│   └── game/                 # игровая сессия
│       ├── lib/
│       │   └── gameLoop.ts         # порт startGameProcess / createNewLine
│       └── model/
│           └── gameStore.ts        # zustand: score, nextType, step, isGameOver, board, actions
├── features/
│   ├── place-cell/           # обработка клика по колонке
│   │   └── model/usePlaceCell.ts
│   └── restart-game/
│       └── model/useRestartGame.ts
├── widgets/
│   ├── main-menu/
│   │   ├── ui/MainMenu.tsx
│   │   └── ui/MainMenu.module.css
│   └── game-view/
│       ├── ui/GameView.tsx
│       ├── ui/Board.tsx            # рендер 7×7 с CSS-grid + transitions
│       ├── ui/Cell.tsx
│       ├── ui/Hud.tsx              # score, next, step-bar
│       ├── ui/GameOverOverlay.tsx
│       └── ui/*.module.css
└── shared/
    ├── config/constants.ts         # NUM_ROWS, NUM_COLUMNS, durations
    ├── lib/storage.ts              # safe localStorage wrapper
    ├── lib/uid.ts                  # стабильные id для key= в React
    └── ui/
        ├── Button/                 # минималистичная кнопка
        └── StepBar/                # 10-секционный индикатор
```

---

## 5. Сопоставление поведения iOS → Web

| iOS-механизм | Web-эквивалент |
|---|---|
| `SwiftUI @StateObject` / `ObservableObject` | `zustand` store с селекторами + `useSyncExternalStore` под капотом |
| SpriteKit `SKAction.move` (анимация падения) | CSS-grid + `transform: translateY()` + `transition: transform 300ms ease` на каждой `Cell` |
| SpriteKit `SKAction.scale` (взрыв при удалении) | CSS-класс `.removing` с `transform: scale(1.3)` + `opacity: 0`, 700ms |
| Всплывающий «+score» (`createScoreSprite`) | абсолютно спозиционированный React-узел с `keyframes` (вверх + fade), удаляется по `onAnimationEnd` |
| `DispatchQueue.main.asyncAfter` | `await sleep(ms)` (Promise + setTimeout) внутри async `gameLoop` |
| `touchLock` (блокировка ввода во время анимации) | `gameStore.isAnimating` флаг |
| `UserDefaults` + JSONEncoder | `localStorage` + zustand `persist` middleware |
| `UIApplication.willResignActive` / `didBecomeActive` | `document.visibilitychange` + flush в `pagehide`/`beforeunload` |
| `arc4random_uniform` / `Int.random(in:)` | `Math.random()` — инжектируем через `RNG` интерфейс, чтобы тесты могли подставить детерминированный seed (см. `seedrandom` или собственный `mulberry32`) |
| `colorScheme` (light/dark) | `prefers-color-scheme` media query + CSS-переменные |
| Локализация `Localizable.strings` | На первом этапе — английские строки инлайн; добавить i18n при необходимости |

---

## 6. Порядок миграции (поэтапный)

| # | Этап | Что появляется | Тесты |
|---|---|---|---|
| 1 | **Скаффолд проекта**: Vite + React + TS + Vitest + ESLint + Prettier | пустое приложение запускается | smoke `App renders` |
| 2 | **Domain core**: `Cell`, `CellType`, `Grid`, `randomCellType` (с инжектируемым RNG) | модуль `entities/board/lib` | unit-тесты типов + RNG distribution |
| 3 | **Level (порт `Level.swift`)**: `addCell`, `checkMatches`, `applyGravity`, `topRow*`, `shiftUp`, обработка gray/black соседей | `entities/board/lib/level.ts` | **обязательные** unit-тесты на каждое правило: матч по строке, по колонке, x2 на пересечении, gray-сосед, black→gray, гравитация, shiftUp |
| 4 | **GameStore + gameLoop**: порт `Store` + `startGameProcess` / `createNewLine` | `entities/game` | интеграционный тест: симуляция последовательности ходов и проверка финального состояния |
| 5 | **Persistence**: `localStorage` через zustand persist | сохранение/восстановление между ребутами | тест: snapshot → restore == equal |
| 6 | **UI shared**: `Button`, `StepBar` (+ tokens.css) | базовые компоненты | визуальный smoke |
| 7 | **MainMenu** | первый экран | smoke |
| 8 | **GameView**: Board + Cell + Hud + анимации | играбельная версия | e2e-тест клика по колонке (Testing Library) |
| 9 | **GameOver overlay + Retry** | полный игровой цикл | e2e: довести до game over, retry |
| 10 | **README.md + чистка** | финальная версия | — |

---

## 7. Дизайн нового UI (минимализм)

Стиль: спокойный, скандинавско-японский «paper & ink», без скевоморфизма и неона из оригинала.

**Цветовая палитра (CSS-переменные, light по умолчанию, dark через `@media`):**

```
--bg:          #FAF9F6   (тёплый off-white)
--surface:     #FFFFFF
--border:      #E8E5DE
--text:        #1F1E1B
--text-muted:  #8A8780
--accent:      #2E2C28   (почти-чёрный)
--cell-1..7:   приглушённые пастельные оттенки одной светлоты
--cell-gray:   #B8B5AE
--cell-black:  #2E2C28
--progress-empty: #ECE9E3
--progress-full:  #1F1E1B
```

**Типографика:** одна гарнитура — `"Inter", system-ui`. Title 600 / Body 400. Числа в ячейках — табличные цифры (`font-variant-numeric: tabular-nums`).

**Ячейка:** скруглённый квадрат 1:1, тонкая внутренняя обводка, центрированная цифра, без иконок. Серая/чёрная — без цифры, чуть темнее заливка. Радиус: `12%` стороны.

**Анимации:** `cubic-bezier(0.22, 1, 0.36, 1)` (мягкий ease-out), длительности из `Constants.Scene` сохраняем (300 / 700 мс). При удалении — scale 1.0 → 1.15 → 0 + opacity, без вспышек.

**Фон:** ровный `--bg`, без паттерна (в отличие от iOS). Опционально — едва заметная вертикальная сетка под ячейками 1px `--border` opacity 0.4.

**Кнопки:** прозрачные с обводкой, hover — заливка `--accent`, текст `--bg`. Без теней, без градиентов.

---

## 8. Риски и подводные камни

| Риск | Митигация |
|---|---|
| **Поведение `gray`/`black` обработки** в `checkGrayElement` — порядок важен: сначала превращаем gray→random, потом black→gray. Если переставить местами — black моментально станет random за один проход. | 1:1 порт порядка. Покрыть юнит-тестом конкретный сценарий «black рядом с удалением». |
| **Двойной матч (×2)** — iOS обнаруживает по `firstIndex(where: $0.sprite == elem.sprite)`. У нас спрайтов нет, нужен стабильный `id` у каждой ячейки. | При создании ячейки выдаём `crypto.randomUUID()` (`shared/lib/uid.ts`); сравнение по id. |
| **Гонки таймеров** в `startGameProcess` (рекурсия через DispatchQueue). | Переписать как `async/await` цикл — детерминированно, проще тестировать. |
| **RNG** — поведение от запуска к запуску разное; тесты должны быть детерминированы. | Инжектируемый RNG: `interface RNG { next(): number }`. В проде `Math.random`, в тестах — `mulberry32(seed)`. |
| **Persistence формат** — несовместим с iOS UserDefaults бинарным форматом. Это не цель, но в README отметить, что прогресс iOS не импортируется. | Чёткое примечание в README. |
| **Game Over edge-cases**: оригинал ставит `isGameOver` в `touchesBegan` только если `addComb` вернул `-1` **и** `topLineIsFull()`. То есть можно заполнить одну колонку и продолжить играть в других — это «фича», сохраняем. | Тест: заполнить одну колонку, тапать по соседней — игра продолжается. |
| **`step > 0.9`** vs. `>= 1.0` — iOS использует именно `> 0.9` после `+= 0.1`, что из-за float может срабатывать на 10-м или 11-м ходу. Сохраним 1:1 в TS, используя ту же логику с double. | Прямой порт; альтернатива — целочисленный счётчик `stepsSinceShift` (`>= 10`). В TS выберу **целочисленный счётчик** ради детерминизма, но визуально progress = `stepsSinceShift / 10` — поведение совпадает с оригиналом по факту, а float-багов нет. Зафиксировать решение в README → раздел «Differences». |
| **iOS-only тач-координаты** в `convertPoint` — у нас просто `onClick` на колонке. Никаких пиксельных вычислений не нужно. | DOM-обработчик на каждой колонке. |
| **Адаптив** — iOS фиксирует `mainWidth = screen - 40`. В Web нужен responsive (mobile-first). | CSS-grid с `aspect-ratio: 1`, max-width ~480 px, центрирование. |

---

## 9. Что **не** переносим (и почему)

- Иконки 1.png..7.png, gray.png, black.png — заменены типографикой + цветом.
- backgroundPattern — заменён ровным фоном.
- SpriteKit и весь touch-handling — не нужен в DOM.
- Fastlane / Xcode / Info.plist — нерелевантно для web.
- Localizable.strings (пустой файл в оригинале) — отложено.

## 10. Чек-лист «поведение совпадает»

- [ ] 3 единицы в ряду по горизонтали → удаляются (×1)
- [ ] 4 двойки в ряду → не удаляются (длина 4 ≠ 2)
- [ ] 5 пятёрок в ряду → удаляются (×1)
- [ ] Ячейка участвует и в горизонтальном, и в вертикальном матче → ×2
- [ ] Gray-сосед удалённой ячейки → становится случайным цветным
- [ ] Black-сосед удалённой ячейки → становится gray (не сразу цветным)
- [ ] После 10 ходов появляется новая строка снизу
- [ ] В новой строке ровно одна цветная ячейка, остальные — gray/black
- [ ] Каскад из >1 итерации даёт растущий iterationScoreMultiplier
- [ ] После каскада multiplier сбрасывается в 1
- [ ] Game over срабатывает только когда вся верхняя строка занята
- [ ] Сохранение/восстановление возвращает поле и счёт идентично

---

## 11. Tech-stack нового проекта

- **Vite 5** + **React 18** + **TypeScript 5** (strict)
- **Zustand** + `persist` middleware
- **CSS Modules** (никакого runtime CSS-in-JS — это требование задачи)
- **Vitest** + **@testing-library/react** для тестов
- **ESLint** (typescript-eslint) + **Prettier**

Никаких UI-китов, никаких иконочных шрифтов — намеренно тонкий стек ради чистого минималистичного результата.
