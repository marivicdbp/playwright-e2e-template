# Test Tagging Standard

Every Playwright `test()` must carry a `tag: [...]` array with the seven
categories below. Tags go on `test()`, never on `describe()`. Test titles are
descriptive and must **not** contain a ticket ID.

## Required tags

| Category    | Namespace     | Allowed values                                               | Count     |
| ----------- | ------------- | ------------------------------------------------------------ | --------- |
| Ticket ID   | `@<KEY>-<N>`  | any `@[A-Z]+-\d+` (e.g. `@PROJ-1`)                           | 1+        |
| Test type   | `@TestType:`  | `EndToEnd`, `Smoke`, `Sanity`, `Regression`, `Accessibility` | exactly 1 |
| User type   | `@UserType:`  | `Anonymous`, `Authenticated`, `Admin`                        | 1+        |
| Environment | `@Env:`       | `Dev`, `Staging`, `Prod`                                     | 1+        |
| Product     | `@Product:`   | `Google`                                                     | exactly 1 |
| Area        | `@Area:`      | PascalCase, open vocabulary                                  | 1+        |
| Component   | `@Component:` | PascalCase, open vocabulary                                  | 1+        |

`TestType`, `UserType`, `Env`, and `Product` are validated against fixed lists;
ticket ID, `Area`, and `Component` by format only.

Recommended order: ticket IDs, `@Product`, `@Area`, `@Component`, `@TestType`,
`@UserType`, `@Env`.

## Example

```ts
test(
  'Homepage loads with logo and search box',
  {
    tag: [
      '@PROJ-1',
      '@Product:Google',
      '@Area:Homepage',
      '@Component:SearchBox',
      '@TestType:Smoke',
      '@UserType:Anonymous',
      '@Env:Prod',
    ],
  },
  async ({ googleHome }) => {
    await test.step('Verify homepage is loaded', () =>
      googleHome.shouldBeLoaded())
  },
)
```

## Extending the allowlists

Edit `TEST_TYPES`, `USER_TYPES`, `ENVS`, and `PRODUCTS` at the top of
`eslint-rules/require-test-tags.js` and update the table above.

## Running a subset

Tags work with `--grep`, e.g. `npx playwright test --grep @TestType:Smoke`.
