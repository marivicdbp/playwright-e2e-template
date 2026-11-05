import { test as base } from '@playwright/test'
import { GoogleHomePage } from '@google/support/page-objects/google-home.page'

interface Fixtures {
  googleHome: GoogleHomePage
}

// Fixtures give each test ready-made objects. Writing `async ({ googleHome })`
// in a test makes Playwright create a fresh GoogleHomePage for it.
// To add a new page object: import it, add it to `Fixtures`, and add a block below.
export const test = base.extend<Fixtures>({
  googleHome: async ({ page }, use) => {
    await use(new GoogleHomePage(page))
  },
})

export { expect } from '@playwright/test'
