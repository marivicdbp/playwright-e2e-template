import { createPlaywrightConfig } from '@playwright-setup'
import prodConfig from './config-files/prod'

// Add more environments (dev, staging) as additional projects.
export default createPlaywrightConfig([{ name: 'prod', config: prodConfig }])
