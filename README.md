# Playwright E2E Template

A starter monorepo for Playwright end-to-end tests in TypeScript. It ships with
a sample `google` package that tests [google.com](https://www.google.com), plus
the conventions that keep a growing suite maintainable:

- **One package per app under test** (`packages/<app>`) sharing one config factory
- **Page objects + fixtures**, so specs read as scenarios
- **Enforced tagging** (7-tag standard) for filtering and reporting
- **Enforced `test.step` blocks**, so reports and CI logs read as labelled steps
- **No inline selectors in specs**, enforced by a custom ESLint rule
- **Accessibility checks** via axe-core
- **GitHub Actions CI** with lint, typecheck, and a per-package test matrix

## Quick start

```bash
nvm use                      # Node 24
npm install
npx playwright install chromium
npm test                     # runs packages/google
```

Inside a package:

```bash
cd packages/google
npm run pw:run               # headless
npm run pw:open              # UI mode
npm run pw:headed
npx playwright test --grep @TestType:Smoke
npm run pw:report            # open the last HTML report
```

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

## Scripts

| Command                  | What it does                           |
| ------------------------ | -------------------------------------- |
| `npm test`               | Run the google package tests           |
| `npm run lint`           | ESLint (incl. tag/step/selector rules) |
| `npm run lint:tags`      | Lint spec files only                   |
| `npm run typecheck`      | `tsc --noEmit`                         |
| `npm run test:lint-rule` | Unit tests for the custom ESLint rules |
| `npm run format`         | Prettier write                         |

## Notes on the google.com sample

- Google often serves a `/sorry` bot challenge to headless browsers after a
  search, so the search test asserts the query reached `/search` (directly or
  via the challenge's `continue=` URL) rather than result content.
- The accessibility test disables two axe rules google.com currently fails
  (`color-contrast`, `link-in-text-block`); in your own app, fix them instead.
- EU regions show a cookie consent dialog; `GoogleHomePage.open()` accepts it.
