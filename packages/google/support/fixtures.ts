import { test as base } from '@playwright/test'
import { GoogleHomePage } from '@google/support/page-objects/google-home.page'

interface Fixtures {
  googleHome: GoogleHomePage
}

// Page-object fixtures: specs ask for `googleHome` instead of constructing it.
export const test = base.extend<Fixtures>({
  googleHome: async ({ page }, use) => {
    await use(new GoogleHomePage(page))
  },
})

export { expect } from '@playwright/test'
