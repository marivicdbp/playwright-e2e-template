import { RuleTester } from 'eslint'
import tsParser from '@typescript-eslint/parser'
import rule from './no-inline-selectors.js'

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
})

ruleTester.run('no-inline-selectors', rule, {
  valid: [
    // The point of the rule: the spec drives a page object, which owns the
    // selector.
    {
      code: `test('searches', async ({ page }) => {
        await test.step('open grid', () => waitForGridReady(page))
      })`,
    },
    // A locator built from a page-object helper, not a literal.
    {
      code: `test('t', async ({ page }) => {
        await resultsGroup(page).locator(firstLink).click()
      })`,
    },
    // Non-selector string arguments must not be flagged.
    {
      code: `test('t', async ({ page }) => { await page.goto('/inventory') })`,
    },
    {
      code: `test('t', async ({ page }) => { await expect(page).toHaveTitle('Inventory') })`,
    },
    // getByRole with a role but no selector-ish literal is still a locator
    // call — but the *accessible name* form is how specs should assert, so a
    // bare role plus name option is allowed.
    {
      code: `test('t', async ({ page }) => {
        await page.getByRole('button', { name: 'Save' }).click()
      })`,
      options: [{ allowRoleQueries: true }],
    },
  ],
  invalid: [
    // Raw CSS in a spec.
    {
      code: `test('t', async ({ page }) => {
        await page.locator('.sm-button--loading').waitFor()
      })`,
      errors: [{ messageId: 'inlineSelector' }],
    },
    // data-testid is still a selector that belongs in a page object.
    {
      code: `test('t', async ({ page }) => {
        await page.getByTestId('readonly-cell').click()
      })`,
      errors: [{ messageId: 'inlineSelector' }],
    },
    // Template literal selectors count too.
    {
      code: `test('t', async ({ page }) => {
        await page.locator(\`[data-row="\${id}"]\`).click()
      })`,
      errors: [{ messageId: 'inlineSelector' }],
    },
    // Raw DOM query inside evaluate.
    {
      code: `test('t', async ({ page }) => {
        await page.evaluate(() => document.querySelector('.trigger').click())
      })`,
      errors: [{ messageId: 'inlineSelector' }],
    },
    // Nested inside a test.step is no excuse.
    {
      code: `test('t', async ({ page }) => {
        await test.step('click', async () => {
          await page.locator('#save').click()
        })
      })`,
      errors: [{ messageId: 'inlineSelector' }],
    },
    // Chained off another locator.
    {
      code: `test('t', async ({ page }) => {
        await row.locator('td.amount').textContent()
      })`,
      errors: [{ messageId: 'inlineSelector' }],
    },
    // Role queries are reported when the option is off (the default).
    {
      code: `test('t', async ({ page }) => {
        await page.getByRole('button', { name: 'Save' }).click()
      })`,
      errors: [{ messageId: 'inlineSelector' }],
    },
    // Two separate offences report twice.
    {
      code: `test('t', async ({ page }) => {
        await page.locator('.a').click()
        await page.locator('.b').click()
      })`,
      errors: [
        { messageId: 'inlineSelector' },
        { messageId: 'inlineSelector' },
      ],
    },
  ],
})

console.log('no-inline-selectors: all cases passed')
