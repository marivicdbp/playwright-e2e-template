import AxeBuilder from '@axe-core/playwright'
import { expect, type Page } from '@playwright/test'

export interface A11yOptions {
  include?: string[]
  exclude?: string[]
  // Rule ids to skip, e.g. known third-party violations.
  disableRules?: string[]
  // Fail only on these impacts (default: serious + critical).
  impacts?: Array<'minor' | 'moderate' | 'serious' | 'critical'>
}

export async function expectNoA11yViolations(
  page: Page,
  opts: A11yOptions = {},
) {
  let builder = new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa'])
  opts.include?.forEach((s) => (builder = builder.include(s)))
  opts.exclude?.forEach((s) => (builder = builder.exclude(s)))
  if (opts.disableRules?.length)
    builder = builder.disableRules(opts.disableRules)

  const impacts = opts.impacts ?? ['serious', 'critical']
  const { violations } = await builder.analyze()
  const blocking = violations.filter(
    (v) => v.impact && impacts.includes(v.impact),
  )
  expect(
    blocking.map((v) => `${v.id} (${v.impact}): ${v.nodes.length} node(s)`),
  ).toEqual([])
}
