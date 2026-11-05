import { RuleTester } from 'eslint'
import tsParser from '@typescript-eslint/parser'
import rule from './no-ungrouped-test-actions.js'

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
})

ruleTester.run('no-ungrouped-test-actions', rule, {
  valid: [
    // Everything is inside steps.
    {
      code: `test('all grouped', async ({ page }) => {
        await test.step('open', async () => { await page.goto('/') })
        await test.step('check', async () => { await page.click('x') })
      })`,
    },
    // Sync setup / declarations alongside steps are fine (no await).
    {
      code: `test('sync setup ok', async ({ page }) => {
        const nav = page.locator('.nav')
        await test.step('open', async () => { await nav.click() })
      })`,
    },
    // A loop that wraps its actions in a step is grouped.
    {
      code: `test('loop with step', async ({ page }) => {
        for (const x of ['a', 'b']) {
          await test.step(x, async () => { await page.click(x) })
        }
      })`,
    },
    // Fully stepless test — NOT this rule's concern (require-test-step handles it).
    {
      code: `test('no steps at all', async ({ page }) => {
        await page.goto('/')
        await page.click('x')
      })`,
    },
    // Delegates an action to a same-file step-helper, alongside its own step.
    {
      code: `const arrange = async (page) => { await test.step('s', async () => {}) }
        test('mix', async ({ page }) => {
          await arrange(page)
          await test.step('act', async () => { await page.click('x') })
        })`,
    },
  ],
  invalid: [
    // A bare awaited action before the steps.
    {
      code: `test('bare setup', async ({ page }) => {
        await page.goto('/')
        await test.step('check', async () => { await page.click('x') })
      })`,
      errors: [{ messageId: 'ungrouped' }],
    },
    // A trailing bare assertion after the steps.
    {
      code: `test('trailing assert', async ({ page }) => {
        await test.step('act', async () => { await page.click('x') })
        await expect(page).toHaveURL('/done')
      })`,
      errors: [{ messageId: 'ungrouped' }],
    },
    // Two bare actions + one real step → two reports.
    {
      code: `test('two bare', async ({ page }) => {
        await page.goto('/')
        await expect(page.locator('h1')).toBeVisible()
        await test.step('act', async () => { await page.click('x') })
      })`,
      errors: [{ messageId: 'ungrouped' }, { messageId: 'ungrouped' }],
    },
  ],
})

console.log('no-ungrouped-test-actions: all RuleTester cases passed')
