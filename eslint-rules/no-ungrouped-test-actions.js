'use strict'

// Companion to require-test-step.js. Where require-test-step guarantees a test
// has *at least one* step, this rule surfaces awaited actions that sit OUTSIDE
// any test.step — bare lines that render as unlabelled entries in the Playwright
// report, above/below the named steps. Grouping them into a named step makes the
// test read as a complete labelled sequence.
//
// Deliberately scoped to avoid noise:
//   • only fires on tests that already contain a step (a fully-stepless test is
//     require-test-step's job — no double reporting);
//   • a statement that itself contains a test.step (e.g. a for/if/try wrapping
//     steps) is already grouped and is skipped;
//   • a statement that delegates to a same-file step-helper is skipped;
//   • statements with no await (declarations, sync setup, diagnostics) are
//     ignored — only real actions are flagged.
// Adoption phase: wired in as "warn", not "error".

const {
  testCallback,
  isTestStepCall,
  containsTestStep,
  collectCalledNames,
  stepHelperNames,
  walk,
} = require('./test-ast.js')

// Does this subtree contain an await that belongs to it (not to a nested
// function)? Identifies statements that perform an asynchronous action.
function hasOwnAwait(node) {
  let found = false
  ;(function visit(n) {
    if (!n || typeof n !== 'object' || typeof n.type !== 'string' || found) {
      return
    }
    if (n.type === 'AwaitExpression') {
      found = true
      return
    }
    // An await inside a nested function belongs to that function, not here.
    if (
      n.type === 'ArrowFunctionExpression' ||
      n.type === 'FunctionExpression' ||
      n.type === 'FunctionDeclaration'
    ) {
      return
    }
    for (const key of Object.keys(n)) {
      if (key === 'parent') continue
      const value = n[key]
      if (Array.isArray(value)) {
        for (const child of value) visit(child)
      } else if (value && typeof value.type === 'string') {
        visit(value)
      }
    }
  })(node)
  return found
}

// Unwrap `await expr;` / `expr;` down to the underlying CallExpression.
function underlyingCall(statement) {
  if (statement.type !== 'ExpressionStatement') return null
  let expr = statement.expression
  if (expr.type === 'AwaitExpression') expr = expr.argument
  return expr.type === 'CallExpression' ? expr : null
}

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Flag awaited actions that sit outside any test.step in a test that uses steps',
    },
    schema: [],
    messages: {
      ungrouped:
        "This awaited action sits outside any test.step(...). Group it into a named step (e.g. `await test.step('Open page', async () => { ... })`) so the Playwright report reads as a labelled sequence.",
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
        if (!callback || callback.body.type !== 'BlockStatement') return
        // Only enforce on tests that already group *something* into steps;
        // a fully-stepless test is reported by require-test-step instead.
        if (!containsTestStep(callback.body)) return

        for (const statement of callback.body.body) {
          const call = underlyingCall(statement)
          if (call && isTestStepCall(call)) continue // the step itself
          if (!hasOwnAwait(statement)) continue // sync setup / declarations
          if (containsTestStep(statement)) continue // for/if/try wrapping steps
          // Delegates its action to a same-file step-helper.
          const calledNames = new Set()
          collectCalledNames(statement, calledNames)
          if ([...calledNames].some((name) => stepHelpers.has(name))) continue

          context.report({ node: statement, messageId: 'ungrouped' })
        }
      },
    }
  },
}
