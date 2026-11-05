'use strict'

// local/no-inline-selectors
//
// A selector literal in a spec file is a locator that no other test can reuse
// and that nothing re-verifies when the UI changes. Locators belong in the
// package's page objects under `support/`, where they are named, waited on, and
// shared, so other authors can find and reuse the proven one.
//
// Reported: a string or template literal passed as the first argument to a
// Playwright locator factory, or to a raw document query inside page.evaluate.

const LOCATOR_APIS = new Set([
  'locator',
  'frameLocator',
  'getByTestId',
  'getByLabel',
  'getByText',
  'getByPlaceholder',
  'getByTitle',
  'getByAltText',
  'querySelector',
  'querySelectorAll',
])

// Kept separate: a role query reads as an accessibility assertion rather than a
// brittle selector, so teams may want it allowed in specs.
const ROLE_API = 'getByRole'

const isLiteralSelector = (node) =>
  node &&
  (node.type === 'Literal'
    ? typeof node.value === 'string'
    : node.type === 'TemplateLiteral')

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow selector literals in spec files; move them into a page object under support/.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          // Allow page.getByRole('button', { name: 'Save' }) in specs.
          allowRoleQueries: { type: 'boolean' },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      inlineSelector:
        "Selector '{{selector}}' is inline in a spec. Move it into a page object under support/ and call that helper instead, so the locator is named, waited on, and reusable (see CLAUDE.md).",
    },
  },

  create(context) {
    const { allowRoleQueries = false } = context.options[0] ?? {}

    return {
      CallExpression(node) {
        const callee = node.callee
        if (callee.type !== 'MemberExpression') return
        const name =
          callee.property.type === 'Identifier' ? callee.property.name : null
        if (!name) return

        const isRole = name === ROLE_API
        if (isRole ? allowRoleQueries : !LOCATOR_APIS.has(name)) return

        const arg = node.arguments[0]
        if (!isLiteralSelector(arg)) return

        const selector =
          arg.type === 'Literal'
            ? arg.value
            : context.sourceCode.getText(arg).slice(1, -1)

        context.report({
          node: arg,
          messageId: 'inlineSelector',
          data: {
            selector:
              String(selector).length > 60
                ? `${String(selector).slice(0, 57)}...`
                : String(selector),
          },
        })
      },
    }
  },
}
