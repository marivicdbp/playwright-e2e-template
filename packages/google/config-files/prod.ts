import 'dotenv/config'
import type { TestEnvironmentConfig } from '@config-interface'

const config: TestEnvironmentConfig = {
  baseUrl: process.env.BASE_URL ?? 'https://www.google.com',
  env: {
    ENVIRONMENT: 'prod',
  },
}

export default config
