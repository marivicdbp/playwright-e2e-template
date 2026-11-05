# Playwright E2E Template

A beginner-friendly starter project for writing browser tests with
[Playwright](https://playwright.dev) and TypeScript. It comes with working
example tests against [google.com](https://www.google.com) that you can copy.

> **New to this?** Read **[docs/getting-started.md](docs/getting-started.md)** —
> it walks you from installing Node to writing your first test.

## Quick start

```bash
npm run setup        # install packages + Chromium (first time only)
npm test             # run all tests
npm run test:ui      # open Playwright's visual runner (great for learning)
npm run report       # view the HTML report of the last run
```

Other handy commands:

| Command               | What it does                                  |
| --------------------- | --------------------------------------------- |
| `npm run test:headed` | Run tests with the browser visible            |
| `npm run test:debug`  | Step through a test line by line              |
| `npm run test:smoke`  | Run only tests tagged `@TestType:Smoke`       |
| `npm run codegen`     | Record clicks on google.com and generate code |
| `npm run lint`        | Check code follows the conventions            |
| `npm run format`      | Auto-format all files                         |

## What's included

- Example **tests**, **page objects**, and **fixtures** with explanatory comments
- Shared Playwright config (screenshots, videos and traces on failure)
- **Accessibility** check example using axe-core
- **Lint rules** that teach good habits (tags, named steps, no selectors in tests)
- **GitHub Actions CI** that lints and runs tests on every push/PR
- VS Code recommended extensions and format-on-save

## Layout

```
.
├── libs/
│   ├── playwright-setup.ts        # createPlaywrightConfig() shared by all packages
│   ├── config-interface.ts        # environment config types
│   └── page-helpers/
│       ├── common.ts              # BasePage
│       └── accessibility.ts       # expectNoA11yViolations()
├── packages/
│   └── google/
│       ├── playwright.config.ts   # one project per environment
│       ├── config-files/prod.ts   # baseURL + env values (BASE_URL overrides)
│       ├── support/
│       │   ├── fixtures.ts        # page-object fixtures (test, expect)
│       │   └── page-objects/      # selectors live here
│       └── tests/                 # *.spec.ts
├── eslint-rules/                  # custom rules + their unit tests
├── scripts/create-package.sh      # scaffold a new package
└── docs/test-tagging-standard.md
```

## Writing a test

```ts
import { test } from '@google/support/fixtures'

test(
  'Typing a query shows autocomplete suggestions',
  {
    tag: [
      '@PROJ-3',
      '@Product:Google',
      '@Area:Search',
      '@Component:Autocomplete',
      '@TestType:Regression',
      '@UserType:Anonymous',
      '@Env:Prod',
    ],
  },
  async ({ googleHome }) => {
    await test.step('Open homepage', () => googleHome.open())
    await test.step('Type a query', () => googleHome.typeQuery('playwright'))
    await test.step('Verify suggestions are shown', () =>
      googleHome.shouldShowSuggestions())
  },
)
```

Rules, enforced by `npm run lint`:

1. Every `test()` has the 7-tag array — see [docs/test-tagging-standard.md](docs/test-tagging-standard.md).
2. Every `test()` body is made of named `test.step(...)` calls.
3. Selectors live in page objects; specs may use `getByRole(...)` only.
4. Imports use the tsconfig aliases, not `../../` paths.
5. Page-object assertion methods are named `should*`, `verify*`, `assert*`,
   `expect*`, or `check*` so `playwright/expect-expect` recognises them.

## Adding an app under test

```bash
./scripts/create-package.sh my-app https://my-app.example.com
```

Then follow the printed steps (tsconfig alias, `@Product` allowlist, CI matrix).
Add environments by creating `config-files/<env>.ts` and another project entry
in the package's `playwright.config.ts`.

## Notes on the google.com sample

- Google often serves a `/sorry` bot challenge to headless browsers after a
  search, so the search test asserts the query reached `/search` (directly or
  via the challenge's `continue=` URL) rather than result content.
- The accessibility test disables two axe rules google.com currently fails
  (`color-contrast`, `link-in-text-block`); in your own app, fix them instead.
- EU regions show a cookie consent dialog; `GoogleHomePage.open()` accepts it.
