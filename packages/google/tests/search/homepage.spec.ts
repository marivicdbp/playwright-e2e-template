// 👋 New to Playwright? Start here. This file is a fully commented example.
//
// We import `test` from our fixtures file (not from '@playwright/test') so that
// every test can ask for ready-made page objects like `googleHome`.
import { test } from '@google/support/fixtures'

// `test.describe` groups related tests. They show up together in the report.
test.describe('Google homepage', () => {
  // `beforeEach` runs before every test in this group: open google.com.
  test.beforeEach(async ({ googleHome }) => {
    await googleHome.open()
  })

  test(
    // 1️⃣ Title: say what the test checks, in plain English.
    'Homepage loads with logo and search box',
    // 2️⃣ Tags: labels used to filter runs (e.g. `npm run test:smoke`).
    //    All 7 kinds are required; see docs/test-tagging-standard.md.
    {
      tag: [
        '@PROJ-1', // your ticket ID
        '@Product:Google', // which app
        '@Area:Homepage', // which part of the app
        '@Component:SearchBox', // which feature
        '@TestType:Smoke', // Smoke, Regression, EndToEnd, ...
        '@UserType:Anonymous', // who is using the app
        '@Env:Prod', // which environment
      ],
    },
    // 3️⃣ Body: ask for the fixtures you need, then write named steps.
    async ({ googleHome }) => {
      // Each `test.step` appears as a labelled line in the report,
      // so when a test fails you can see exactly which step broke.
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
