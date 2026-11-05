import tseslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import playwright from 'eslint-plugin-playwright'
import prettier from 'eslint-config-prettier'
import localRules from './eslint-rules/index.js'

const pwRecommended = playwright.configs['flat/recommended']

// The full Playwright recommended set is enforced as "error". Rules the
// recommended config leaves "off" stay off; every other rule is promoted.
const pwRulesAsError = Object.fromEntries(
  Object.entries(pwRecommended.rules ?? {}).map(([rule, level]) => {
    if (Array.isArray(level)) {
      const [, ...options] = level
      return [rule, ['error', ...options]]
    }
    return [rule, level === 'off' || level === 0 ? level : 'error']
  }),
)

export default [
  {
    // Type-aware linting (needed for no-floating-promises) across all source.
    files: ['packages/**/*.ts', 'libs/**/*.ts'],
    plugins: {
      '@typescript-eslint': tseslint,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      // An un-awaited promise is the #1 source of flaky/false-passing e2e tests.
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/ban-ts-comment': 'error',
      '@typescript-eslint/no-this-alias': 'error',
      '@typescript-eslint/no-require-imports': 'error',
    },
  },
  {
    // Enforce tsconfig path aliases over deep relative imports (see CLAUDE.md).
    files: ['packages/**/*.ts', 'libs/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../../*', '../../**'],
              message:
                'Use the tsconfig path aliases (@google, @common, ...) instead of deep ../../ relative imports. See CLAUDE.md.',
            },
          ],
        },
      ],
    },
  },
  {
    // Playwright best-practice rules for spec files (enforced as error).
    files: ['packages/**/*.spec.ts'],
    plugins: {
      playwright: pwRecommended.plugins?.playwright ?? playwright,
    },
    rules: {
      ...pwRulesAsError,
      // Pure formatting concern — Prettier's job. Left off to avoid style-only
      // findings overlapping with Prettier.
      'playwright/consistent-spacing-between-blocks': 'off',
      // Assertions commonly live in page-object helpers
      // (shouldBe*/assert*/verify*) rather than a bare expect() in the test
      // body. Teach expect-expect to recognise them (matched by method name) so
      // it stops flagging tests that genuinely assert; bare expect() is still
      // detected by default, so a test with no assertion at all still errors.
      'playwright/expect-expect': [
        'error',
        {
          // Matched against the called method name: page-object assertion
          // helpers are named *Should* (shouldBeLoaded), verify*, assert*,
          // expect*, or check*.
          assertFunctionPatterns: [
            '[Ss]hould',
            '^verify',
            '^assert',
            '^expect',
            '^check',
          ],
        },
      ],
    },
  },
  {
    // Project-local rules for spec files.
    files: ['packages/**/*.spec.ts'],
    plugins: {
      local: localRules,
    },
    rules: {
      // The standard 7-tag array on every test().
      'local/require-test-tags': 'error',
      // Every test() must organise its body into named test.step(...) blocks
      // (or delegate to a same-file helper that does) for readable trace
      // output.
      'local/require-test-step': 'error',
      // Awaited actions outside any test.step in a test that already uses steps
      // must be grouped into a named step (or carry a justified inline disable
      // for intentional setup/teardown). Enforced as error.
      'local/no-ungrouped-test-actions': 'error',
      // Selectors belong in page objects under support/, not inline in specs,
      // so they are named, waited on, and reusable.
      'local/no-inline-selectors': [
        'error',
        // Role queries read as accessibility assertions rather than brittle
        // selectors, so they stay allowed in specs.
        { allowRoleQueries: true },
      ],
    },
  },
  // Must come last: disables stylistic rules that would conflict with Prettier.
  prettier,
]
