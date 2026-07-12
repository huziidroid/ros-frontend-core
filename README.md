# ros-frontend-core

The frontend-only monorepo for Retail OS — a WhatsApp-native AI business OS for B2B wholesale distributors in emerging markets. Companion to `ros-be-service` (the Python/FastAPI backend), which lives in a separate repo.

An Nx + pnpm workspace: `apps/*` holds deployable frontend apps, `packages/*` holds code shared between them. No backend service, no BFF — those live outside this repo.

## Tech stack

| Layer | Tool |
|---|---|
| Monorepo tooling | Nx + pnpm workspaces |
| UI framework | React 19 |
| Build / dev server | Vite |
| Routing | react-router-dom |
| Styling | Tailwind CSS v4 (+ shadcn/ui components) |
| Language | TypeScript |
| Linting | ESLint (flat config), with Nx module-boundary enforcement |
| Testing | Jest (`node` env for pure logic, `jsdom` for anything rendering React) |

## Structure

```
ros-frontend-core/
├── apps/
│   └── web/              # distributor + sub-user portal (React, Vite, Tailwind)
│                          # admin, mobile planned — not built yet
└── packages/
    ├── core/              # @ros/core   — business logic + cross-platform React (context providers, etc.)
    ├── api/                # @ros/api    — typed client functions calling ros-be-service
    ├── types/               # @ros/types  — shared TS types (mirrors backend schemas)
    ├── utils/                # @ros/utils  — generic helpers (incl. config-loading)
    ├── ui-web/                # @ros/ui-web       — presentational components (Tailwind/shadcn, web-only)
    └── components-web/         # @ros/components-web — ui-web + core/api composition (web-only)
```

## Module boundaries

Every package is tagged along two axes, enforced via ESLint (`@nx/enforce-module-boundaries`, see `eslint.config.mjs`):

- **`type:*`** — layering. `ui-web` can't reach into `core`/`api` directly; it has to go through `components-web` (ui + logic composition). Keeps presentational components reusable without business logic baked in.
- **`platform:*`** — target. `platform:web` (`ui-web`, `components-web`) and a future `platform:native` can never depend on each other. `platform:agnostic` (`core`, `api`, `types`, `utils`) is safe for either — both targets run React, so `core` may hold cross-platform React code (context providers), it just can't touch the DOM or a specific renderer.

## Commands

Run from the repo root:

```sh
pnpm install          # install dependencies
pnpm build             # nx run-many -t build — builds every project
pnpm lint               # nx run-many -t lint
pnpm typecheck            # nx run-many -t typecheck
pnpm test                  # nx run-many -t test
pnpm dev:web                # starts the web app's dev server
```

Target a single project directly with `pnpm exec nx run <project>:<target>` — project names are the scoped package names (e.g. `@ros/web`, `@ros/core`), not folder names; run `pnpm exec nx show project <name>` if unsure.

## Adding a package

Prefer generators over hand-authoring so config stays consistent with what Nx expects:

```sh
pnpm exec nx g @nx/js:lib packages/<name> --bundler=swc --unitTestRunner=none --linter=eslint --importPath=@ros/<name> --tags=type:<type>,platform:<platform>
```

For React libraries, use `@nx/react:lib` instead. Tag the new package correctly per the module-boundary scheme above, and add the corresponding `depConstraints` entry in `eslint.config.mjs` if it introduces a new `type:*` or `platform:*` value.
