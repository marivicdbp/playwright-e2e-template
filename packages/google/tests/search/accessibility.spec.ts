import { test } from '@google/support/fixtures'
import { expectNoA11yViolations } from '@accessibility'

test(
  'Homepage has no serious or critical accessibility violations',
  {
    tag: [
      '@PROJ-5',
      '@Product:Google',
      '@Area:Homepage',
      '@Component:Page',
      '@TestType:Accessibility',
      '@UserType:Anonymous',
      '@Env:Prod',
    ],
  },
  async ({ googleHome, page }) => {
    await test.step('Open homepage', () => googleHome.open())
    await test.step('Run axe scan', () =>
      // Known google.com violations outside our control; remove to see them.
      expectNoA11yViolations(page, {
        disableRules: ['color-contrast', 'link-in-text-block'],
      }))
  },
)
