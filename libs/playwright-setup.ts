import { defineConfig, devices } from '@playwright/test'
import type { TestEnvironmentConfig } from '@config-interface'

export interface EnvironmentProject {
  name: string
  config: TestEnvironmentConfig
}

// Shared Playwright config so every package runs with the same defaults.
export function createPlaywrightConfig(
  projects: EnvironmentProject[],
  testDir = 'tests',
) {
  const isCI = !!process.env.CI
  return defineConfig({
    testDir,
    timeout: 50_000,
    fullyParallel: true,
    forbidOnly: isCI,
    retries: isCI ? 2 : 0,
    // Drop the OS suffix so snapshots committed on macOS match in Linux CI.
    snapshotPathTemplate:
      '{snapshotDir}/{testFileDir}/{testFileName}-snapshots/{arg}{-projectName}{ext}',
    use: {
      ...devices['Desktop Chrome'],
      viewport: { width: 1920, height: 1080 },
      locale: 'en-US',
      video: 'retain-on-failure',
      trace: 'on-first-retry',
      screenshot: 'only-on-failure',
    },
    reporter: isCI
      ? [
          [
            'junit',
            { outputFile: 'test-results/junit.xml', includeRetries: true },
          ],
          ['html', { open: 'never' }],
          ['github'],
          ['list', { printSteps: true }],
        ]
      : [
          ['html', { open: 'never' }],
          ['list', { printSteps: true }],
        ],
    projects: projects.map(({ name, config }) => ({
      name,
      use: {
        baseURL: config.baseUrl,
        ...config.env,
      },
    })),
  })
}
