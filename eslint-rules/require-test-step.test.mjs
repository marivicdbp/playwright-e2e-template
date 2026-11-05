import { RuleTester } from 'eslint'
import tsParser from '@typescript-eslint/parser'
import rule from './require-test-step.js'

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
})

ruleTester.run('require-test-step', rule, {
  valid: [
    // Body contains a test.step call.
    {
      code: `test('does a thing', async ({ page }) => {
        await test.step('navigate', async () => { await page.goto('/') })
      })`,
    },
    // Arrow body that is directly a single test.step call.
    {
      code: `test('one-liner', () => test.step('go', () => page.goto('/')))`,
    },
    // Step nested deeper inside the body still counts.
    {
      code: `test('nested', async ({ page }) => {
        if (true) { await test.step('inner', async () => {}) }
      })`,
    },
    // test.skip / test.only definitions with a step.
    {
      code: `test.skip('skipped def', async () => { await test.step('s', async () => {}) })`,
    },
    // Delegation: body calls a same-file helper (arrow const) that has steps.
    {
      code: `const scenario = async (page) => { await test.step('s', async () => {}) }
        test('delegates to arrow helper', async ({ page }) => { await scenario(page) })`,
    },
    // Delegation: body calls a same-file helper (function declaration) that has steps.
    {
      code: `async function runScenario(page) { await test.step('s', async () => {}) }
        test('delegates to function helper', async ({ page }) => { await runScenario(page) })`,
    },
    // Not a test definition — runtime test.skip(cond, reason) inside a hook.
    {
      code: `test.beforeEach(({ environment }) => { test.skip(environment !== 'shared', 'reason') })`,
    },
    // Empty/placeholder body (e.g. an unimplemented test.fixme stub) — nothing
    // to organise into steps, so exempt.
    {
      code: `test.fixme('not implemented yet', async ({ page }) => { /* TODO */ })`,
    },
    // Not a test at all.
    {
      code: `describe('group', () => { foo('bar', () => {}) })`,
    },
  ],
  invalid: [
    {
      code: `test('no steps', async ({ page }) => { await page.goto('/') })`,
      errors: [{ messageId: 'missingStep' }],
    },
    {
      code: `test.only('focused no steps', async ({ page }) => { await page.click('x') })`,
      errors: [{ messageId: 'missingStep' }],
    },
    {
      // Delegates to a helper that itself has NO steps.
      code: `const noSteps = async (page) => { await page.goto('/') }
        test('delegates to stepless helper', async ({ page }) => { await noSteps(page) })`,
      errors: [{ messageId: 'missingStep' }],
    },
  ],
})

console.log('require-test-step: all RuleTester cases passed')
