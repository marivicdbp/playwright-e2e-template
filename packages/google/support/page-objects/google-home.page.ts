import { expect, type Locator, type Page } from '@playwright/test'
import { BasePage } from '@common'

export class GoogleHomePage extends BasePage {
  readonly logo: Locator
  readonly searchBox: Locator
  readonly suggestions: Locator
  readonly feelingLuckyButton: Locator
  readonly gmailLink: Locator
  readonly imagesLink: Locator
  readonly aboutLink: Locator
  readonly privacyLink: Locator
  private readonly consentAcceptButton: Locator

  constructor(page: Page) {
    super(page)
    this.logo = page.getByRole('img', { name: 'Google' })
    this.searchBox = page.getByRole('combobox', { name: 'Search' })
    this.suggestions = page.getByRole('listbox').getByRole('option')
    this.feelingLuckyButton = page
      .getByRole('button', { name: "I'm Feeling Lucky" })
      .first()
    this.gmailLink = page.getByRole('link', { name: 'Gmail' })
    this.imagesLink = page.getByRole('link', { name: /^Images/ })
    this.aboutLink = page.getByRole('link', { name: 'About', exact: true })
    this.privacyLink = page.getByRole('link', { name: 'Privacy', exact: true })
    this.consentAcceptButton = page.getByRole('button', { name: /accept all/i })
  }

  async open() {
    await this.goto('/')
    await this.dismissConsentIfShown()
  }

  // EU regions show a cookie consent dialog before the homepage is usable.
  async dismissConsentIfShown() {
    if (await this.consentAcceptButton.isVisible().catch(() => false)) {
      await this.consentAcceptButton.click()
    }
  }

  async typeQuery(query: string) {
    await this.searchBox.fill(query)
  }

  async search(query: string) {
    await this.typeQuery(query)
    await this.searchBox.press('Enter')
  }

  async shouldBeLoaded() {
    await this.shouldHaveTitle('Google')
    await expect(this.logo).toBeVisible()
    await expect(this.searchBox).toBeVisible()
  }

  async shouldShowSuggestions() {
    await expect(this.suggestions.first()).toBeVisible()
  }

  async shouldShowFooterLinks() {
    await expect(this.aboutLink).toBeVisible()
    await expect(this.privacyLink).toBeVisible()
  }

  async shouldBeOnSearchResultsFor(query: string) {
    // Headless searches often hit Google's /sorry bot challenge, which wraps the
    // results URL in `continue=`; decoding covers both cases.
    const expected = new RegExp(
      `/search\\?(.*&)?q=${encodeURIComponent(query)}(&|$)`,
    )
    await expect(this.page).toHaveURL((url) =>
      expected.test(decodeURIComponent(url.href)),
    )
  }
}
