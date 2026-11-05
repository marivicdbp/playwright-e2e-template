'use strict'

// Shared AST helpers for the project-local Playwright spec rules
// (require-test-step, no-ungrouped-test-actions).

// Walk every child node of an AST subtree, invoking `fn(child)`. Skips the
// `parent` back-reference to avoid infinite recursion.
function walk(node, fn) {
  if (!node || typeof node !== 'object' || typeof node.type !== 'string') {
    return
  }
  fn(node)
  for (const key of Object.keys(node)) {
    if (key === 'parent') continue
    const value = node[key]
    if (Array.isArray(value)) {
      for (const child of value) walk(child, fn)
    } else {
      walk(value, fn)
    }
  }
}

// test, test.only, test.skip, test.fixme, test.fail, test.slow — NOT
// test.describe / test.beforeEach / runtime test.skip(cond, reason). Returns the
// test's callback function node, or null if `node` is not a test definition.
function testCallback(node) {
  if (node.type !== 'CallExpression') return null
  const callee = node.callee
  let isTest = false
  if (callee.type === 'Identifier') {
    isTest = callee.name === 'test'
  } else if (
    callee.type === 'MemberExpression' &&
    callee.object.type === 'Identifier' &&
    callee.object.name === 'test' &&
    callee.property.type === 'Identifier'
  ) {
    isTest = ['only', 'skip', 'fixme', 'fail', 'slow'].includes(
      callee.property.name,
    )
  }
  if (!isTest) return null

  const args = node.arguments
  if (args.length === 0) return null

  // A real test definition has a static string/template title as its first
  // argument. This excludes runtime guards like test.skip(cond, 'reason').
  const title = args[0]
  if (
    !(title.type === 'Literal' && typeof title.value === 'string') &&
    title.type !== 'TemplateLiteral'
  ) {
    return null
  }

  // The callback is the last argument and must be a function.
  const last = args[args.length - 1]
  if (
    last.type === 'FunctionExpression' ||
    last.type === 'ArrowFunctionExpression'
  ) {
    return last
  }
  return null
}

function isTestStepCall(node) {
  return (
    node.type === 'CallExpression' &&
    node.callee.type === 'MemberExpression' &&
    node.callee.object.type === 'Identifier' &&
    node.callee.object.name === 'test' &&
    node.callee.property.type === 'Identifier' &&
    node.callee.property.name === 'step'
  )
}

function containsTestStep(node) {
  let found = false
  walk(node, (n) => {
    if (!found && isTestStepCall(n)) found = true
  })
  return found
}

function collectCalledNames(node, names) {
  walk(node, (n) => {
    if (n.type === 'CallExpression' && n.callee.type === 'Identifier') {
      names.add(n.callee.name)
    }
  })
}

// Names of same-file helpers whose body itself contains test.step. A test that
// delegates its whole scenario to such a helper (e.g. runCrudScenario) is
// organised into steps even though its own body has no literal test.step call.
function stepHelperNames(program) {
  const names = new Set()
  walk(program, (node) => {
    if (
      node.type === 'FunctionDeclaration' &&
      node.id &&
      containsTestStep(node.body)
    ) {
      names.add(node.id.name)
    }
    if (
      node.type === 'VariableDeclarator' &&
      node.id.type === 'Identifier' &&
      node.init &&
      (node.init.type === 'ArrowFunctionExpression' ||
        node.init.type === 'FunctionExpression') &&
      containsTestStep(node.init.body)
    ) {
      names.add(node.id.name)
    }
  })
  return names
}

module.exports = {
  walk,
  testCallback,
  isTestStepCall,
  containsTestStep,
  collectCalledNames,
  stepHelperNames,
}
