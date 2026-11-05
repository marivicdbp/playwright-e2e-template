# Getting Started (Beginner Guide)

No prior Playwright experience needed. Follow the steps in order.

## 1. Install the tools (one time)

1. **Node.js 24** — download from <https://nodejs.org> (or `nvm install 24`).
   Check it worked: `node -v` should print `v24.x.x`.
2. **Git** — <https://git-scm.com>.
3. **VS Code** (recommended) — <https://code.visualstudio.com>. When you open
   this folder, accept the prompt to install the recommended extensions
   (Playwright, ESLint, Prettier).

## 2. Get the project and set it up

```bash
git clone <this-repo-url>
cd playwright-e2e-template
npm run setup        # installs packages + the Chromium browser
```

## 3. Run the tests

```bash
npm test             # run everything in the background (headless)
npm run test:headed  # watch the browser do it
npm run test:ui      # ⭐ best for learning: Playwright's visual test runner
npm run report       # open the HTML report from the last run
```

In **UI mode** you can click a test, press ▶, and step through what happened
with screenshots of every action.

In **VS Code**, open the Testing panel (flask icon) to run or debug any test
with one click.

## 4. Understand the pieces

| File                                    | What it is                                                               |
| --------------------------------------- | ------------------------------------------------------------------------ |
| `packages/google/tests/**/*.spec.ts`    | The tests. Start with `homepage.spec.ts` — it's fully commented.         |
| `packages/google/support/page-objects/` | Page objects: _how to find and use_ things on a page.                    |
| `packages/google/support/fixtures.ts`   | Makes page objects available to tests (`async ({ googleHome }) => ...`). |
| `packages/google/config-files/prod.ts`  | Which website URL to test.                                               |
| `libs/`                                 | Shared code used by every package.                                       |

**Words you'll see**

- **Locator** — a way to find an element, e.g. `page.getByRole('button', { name: 'Search' })`.
- **Assertion** — a check, e.g. `await expect(locator).toBeVisible()`.
- **Page object** — a class grouping the locators/actions for one page.
- **Fixture** — something Playwright creates for each test (like `page` or `googleHome`).
- **Step** — a named chunk of a test (`test.step('...', ...)`) shown in the report.
- **Headless** — the browser runs without a visible window.

## 5. Write your first test

1. **Record it.** Run `npm run codegen`. A browser opens on google.com — click
   around and Playwright writes code for you in the side window. Copy the
   useful locators.
2. **Put locators in the page object.** Open
   `support/page-objects/google-home.page.ts` and add a locator + method, e.g.:

   ```ts
   // in the constructor
   this.signInLink = page.getByRole('link', { name: 'Sign in' })

   // a new method
   async shouldShowSignIn() {
     await expect(this.signInLink).toBeVisible()
   }
   ```

   (Also declare it at the top: `readonly signInLink: Locator`.)

3. **Write the test.** Copy one of the tests in `homepage.spec.ts`, change the
   title, tags, and steps:

   ```ts
   test(
     'Homepage shows a Sign in link',
     {
       tag: [
         '@PROJ-6',
         '@Product:Google',
         '@Area:Homepage',
         '@Component:Header',
         '@TestType:Smoke',
         '@UserType:Anonymous',
         '@Env:Prod',
       ],
     },
     async ({ googleHome }) => {
       await test.step('Verify Sign in link is visible', () =>
         googleHome.shouldShowSignIn())
     },
   )
   ```

4. **Run just your test:** `npx playwright test -g "Sign in" --headed`
   from `packages/google`, or click ▶ next to it in VS Code.
5. **Check your code:** `npm run lint` (see the cheat sheet below if it complains).

## 6. Lint error cheat sheet

The linter enforces the team's conventions. Here's what each message means:

| Message                                                              | Fix                                                                                    |
| -------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `test() must pass an options object with a tag: string[] array`      | Add the `{ tag: [...] }` object as the 2nd argument. Copy one from an existing test.   |
| `must include ... @TestType:` / `@UserType:` / `@Env:` / `@Product:` | A tag is missing or misspelled. Allowed values are in `docs/test-tagging-standard.md`. |
| `Test title ... must not contain a ticket ID`                        | Remove `PROJ-123` from the title; it belongs in the tags.                              |
| `Every test() must organise its body into test.step(...) blocks`     | Wrap your actions: `await test.step('Do X', () => ...)`.                               |
| `Selector '...' is inline in a spec`                                 | Move that locator into a page object and call a method instead.                        |
| `Test has no assertions`                                             | Add an `expect(...)` or call a page-object `should*` method.                           |
| `Promises must be awaited`                                           | Add `await` in front of the Playwright call.                                           |
| `Use the tsconfig path aliases`                                      | Import with `@google/...` or `@common` instead of `../../`.                            |

Many formatting issues fix themselves on save in VS Code, or run `npm run format`.

## 7. When a test fails

1. Read the terminal: it shows the failing **step** and the expected vs received value.
2. Run `npm run report` and open the test: there's a screenshot, a video, and
   (on retries) a trace you can step through.
3. Re-run it slowly: `npm run test:debug` opens the Playwright Inspector so you
   can step line by line.

## 8. Test a different website

```bash
./scripts/create-package.sh my-app https://my-app.example.com
```

Then follow the 4 steps it prints. Copy the google package's page object and
spec as a starting point.

## Useful links

- Playwright docs: <https://playwright.dev/docs/intro>
- Locators guide: <https://playwright.dev/docs/locators>
- Assertions list: <https://playwright.dev/docs/test-assertions>
