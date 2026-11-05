import { test } from '@google/support/fixtures'

test.describe('Google search', () => {
  test.beforeEach(async ({ googleHome }) => {
    await googleHome.open()
  })

  test(
    'Typing a query shows autocomplete suggestions',
    {
      tag: [
        '@PROJ-3',
        '@Product:Google',
        '@Area:Search',
        '@Component:Autocomplete',
        '@TestType:Regression',
        '@UserType:Anonymous',
        '@Env:Prod',
      ],
    },
    async ({ googleHome }) => {
      await test.step('Type a query', () => googleHome.typeQuery('playwright'))
      await test.step('Verify suggestions are shown', () =>
        googleHome.shouldShowSuggestions())
    },
  )

  test(
    'Submitting a query navigates to the results page',
    {
      tag: [
        '@PROJ-4',
        '@Product:Google',
        '@Area:Search',
        '@Component:SearchBox',
        '@TestType:EndToEnd',
        '@UserType:Anonymous',
        '@Env:Prod',
      ],
    },
    async ({ googleHome }) => {
      await test.step('Search for a query', () =>
        googleHome.search('playwright'))
      await test.step('Verify results URL contains the query', () =>
        googleHome.shouldBeOnSearchResultsFor('playwright'))
    },
  )
})
