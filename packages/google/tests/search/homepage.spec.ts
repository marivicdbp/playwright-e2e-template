import { test } from '@google/support/fixtures'

test.describe('Google homepage', () => {
  test.beforeEach(async ({ googleHome }) => {
    await googleHome.open()
  })

  test(
    'Homepage loads with logo and search box',
    {
      tag: [
        '@PROJ-1',
        '@Product:Google',
        '@Area:Homepage',
        '@Component:SearchBox',
        '@TestType:Smoke',
        '@UserType:Anonymous',
        '@Env:Prod',
      ],
    },
    async ({ googleHome }) => {
      await test.step('Verify homepage is loaded', () =>
        googleHome.shouldBeLoaded())
    },
  )

  test(
    'Homepage shows footer links',
    {
      tag: [
        '@PROJ-2',
        '@Product:Google',
        '@Area:Homepage',
        '@Component:Footer',
        '@TestType:Regression',
        '@UserType:Anonymous',
        '@Env:Prod',
      ],
    },
    async ({ googleHome }) => {
      await test.step('Verify About and Privacy links are visible', () =>
        googleHome.shouldShowFooterLinks())
    },
  )
})
