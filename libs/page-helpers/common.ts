import { expect, type Locator, type Page } from '@playwright/test'

// Base class for page objects: owns the page and common waits.
export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  async goto(path = '/') {
    await this.page.goto(path)
  }

  async shouldHaveTitle(title: string | RegExp) {
    await expect(this.page).toHaveTitle(title)
  }

  async shouldBeVisible(locator: Locator) {
    await expect(locator).toBeVisible()
  }
}
