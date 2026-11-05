'use strict'
const requireTestTags = require('./require-test-tags.js')
const requireTestStep = require('./require-test-step.js')
const noUngroupedTestActions = require('./no-ungrouped-test-actions.js')
const noInlineSelectors = require('./no-inline-selectors.js')
module.exports = {
  rules: {
    'require-test-tags': requireTestTags,
    'require-test-step': requireTestStep,
    'no-ungrouped-test-actions': noUngroupedTestActions,
    'no-inline-selectors': noInlineSelectors,
  },
}
