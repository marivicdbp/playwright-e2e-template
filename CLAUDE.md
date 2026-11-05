# Repository guidance

## Test tagging

Every Playwright `test()` must carry the standard 7-tag `tag: [...]` array
(ticket ID, `@TestType`, `@UserType`, `@Env`, `@Product`, `@Area`, `@Component`)
and a descriptive title with no ticket ID. See
[docs/test-tagging-standard.md](docs/test-tagging-standard.md). Enforced by
`npm run lint:tags`.

## Test steps

Every `test()` must organise its body into named `test.step(...)` blocks, or
delegate to a same-file helper composed of steps. Empty `test.fixme` stubs are
exempt. Enforced by `local/require-test-step`; awaited actions left outside a
step in a test that uses steps are flagged by `local/no-ungrouped-test-actions`.

## Selectors and page objects

Selectors belong in page objects under `packages/<pkg>/support/**` (or the
shared `libs/page-helpers`), never inline in a `*.spec.ts`. Enforced by
`local/no-inline-selectors`; `getByRole(...)` stays allowed in specs.

## Imports

Use the tsconfig path aliases (`@google/*`, `@common`, `@accessibility`, ...)
rather than deep `../../` relative paths.
