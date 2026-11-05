'use strict'

// Every real test() should organise its body into test.step(...) blocks. Steps
// produce a readable, labelled trace in the Playwright report (and in CI
// failure output) and double as inline documentation of the scenario. This rule
// is the companion to require-test-tags.js and follows the same AST conventions.

const {
  testCallback,
  containsTestStep,
  collectCalledNames,
  stepHelperNames,
} = require('./test-ast.js')

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Require every test() to organise its body into test.step(...) blocks',
    },
    schema: [],
    messages: {
      missingStep:
        "Every test() must organise its body into test.step(...) blocks for readable trace output. Wrap the actions in `await test.step('descriptive name', async () => { ... })`, or delegate to a helper that does.",
    },
  },
  create(context) {
    let stepHelpers = new Set()

    return {
      Program(program) {
        stepHelpers = stepHelperNames(program)
      },
      CallExpression(node) {
        const callback = testCallback(node)
        if (!callback) return
        // Empty/placeholder bodies (e.g. an unimplemented test.fixme stub) have
        // no actions to organise — nothing to wrap in a step.
        if (
          callback.body.type === 'BlockStatement' &&
          callback.body.body.length === 0
        ) {
          return
        }
        if (containsTestStep(callback.body)) return

        const calledNames = new Set()
        collectCalledNames(callback.body, calledNames)
        for (const name of calledNames) {
          if (stepHelpers.has(name)) return
        }

        context.report({ node, messageId: 'missingStep' })
      },
    }
  },
}
