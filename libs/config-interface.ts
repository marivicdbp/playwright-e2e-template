export type TestEnvironment = 'dev' | 'staging' | 'prod'

export interface TestEnvironmentConfig {
  baseUrl: string
  env: {
    ENVIRONMENT: TestEnvironment
    [key: string]: unknown
  }
}
