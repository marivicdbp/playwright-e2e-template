'use strict'

const TEST_TYPES = [
  'EndToEnd',
  'Smoke',
  'Sanity',
  'Regression',
  'Accessibility',
]
const USER_TYPES = ['Anonymous', 'Authenticated', 'Admin']
const ENVS = ['Dev', 'Staging', 'Prod']
const PRODUCTS = ['Google']

const JIRA_RE = /^@[A-Z]+-\d+$/
const AREA_RE = /^@Area:[A-Z][A-Za-z0-9]+$/
const COMPONENT_RE = /^@Component:[A-Z][A-Za-z0-9]+$/
const TITLE_JIRA_RE = /[A-Z]+-\d+/

// test, test.only, test.skip, test.fixme, test.fail, test.slow — NOT test.describe/step/etc.
function isTestCall(callee) {
  if (callee.type === 'Identifier') return callee.name === 'test'
  if (
    callee.type === 'MemberExpression' &&
    callee.object.type === 'Identifier' &&
    callee.object.name === 'test' &&
    callee.property.type === 'Identifier'
  ) {
    return ['only', 'skip', 'fixme', 'fail', 'slow'].includes(
      callee.property.name,
    )
  }
  return false
}

function stringValues(arrayExpr) {
  return arrayExpr.elements
    .filter((el) => el && el.type === 'Literal' && typeof el.value === 'string')
    .map((el) => el.value)
}

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'problem',
    docs: { description: 'Require the standard tag set on every test()' },
    schema: [],
    messages: {
      missingTagArray:
        'test() must pass an options object with a tag: string[] array.',
      missingJira:
        'test() must include at least one ticket key tag, e.g. @PROJ-1.',
      missingTestType:
        'test() must include exactly one @TestType: tag ({{allowed}}).',
      invalidTestType: 'Invalid @TestType value. Allowed: {{allowed}}.',
      tooManyTestType: 'test() must include exactly one @TestType: tag.',
      missingUserType:
        'test() must include at least one @UserType: tag ({{allowed}}).',
      invalidUserType: 'Invalid @UserType value. Allowed: {{allowed}}.',
      missingEnv: 'test() must include at least one @Env: tag ({{allowed}}).',
      invalidEnv: 'Invalid @Env value. Allowed: {{allowed}}.',
      missingProduct:
        'test() must include exactly one @Product: tag ({{allowed}}).',
      invalidProduct: 'Invalid @Product value. Allowed: {{allowed}}.',
      tooManyProduct: 'test() must include exactly one @Product: tag.',
      missingArea: 'test() must include at least one @Area: tag (PascalCase).',
      missingComponent:
        'test() must include at least one @Component: tag (PascalCase).',
      jiraInTitle:
        'Test title must be descriptive and must not contain a ticket ID.',
    },
  },
  create(context) {
    return {
      CallExpression(node) {
        if (!isTestCall(node.callee)) return
        const [titleArg, optionsArg] = node.arguments
        if (
          !titleArg ||
          titleArg.type !== 'Literal' ||
          typeof titleArg.value !== 'string'
        ) {
          return // dynamic title; cannot statically validate
        }

        // Title must not contain a ticket ID.
        if (TITLE_JIRA_RE.test(titleArg.value)) {
          context.report({ node: titleArg, messageId: 'jiraInTitle' })
        }

        // Find the tag array inside the options object (2nd arg).
        let tagArray = null
        if (optionsArg && optionsArg.type === 'ObjectExpression') {
          const tagProp = optionsArg.properties.find(
            (p) =>
              p.type === 'Property' &&
              ((p.key.type === 'Identifier' && p.key.name === 'tag') ||
                (p.key.type === 'Literal' && p.key.value === 'tag')),
          )
          if (tagProp && tagProp.value.type === 'ArrayExpression')
            tagArray = tagProp.value
        }
        if (!tagArray) {
          context.report({ node, messageId: 'missingTagArray' })
          return
        }

        const tags = stringValues(tagArray)
        const valuesFor = (ns) =>
          tags
            .filter((t) => t.startsWith(ns + ':'))
            .map((t) => t.slice(ns.length + 1))

        // Ticket key (1+)
        if (!tags.some((t) => JIRA_RE.test(t))) {
          context.report({ node: tagArray, messageId: 'missingJira' })
        }

        // TestType (exactly 1, closed)
        const testTypes = valuesFor('@TestType')
        if (testTypes.length === 0) {
          context.report({
            node: tagArray,
            messageId: 'missingTestType',
            data: { allowed: TEST_TYPES.join(', ') },
          })
        } else if (testTypes.length > 1) {
          context.report({ node: tagArray, messageId: 'tooManyTestType' })
        } else if (!TEST_TYPES.includes(testTypes[0])) {
          context.report({
            node: tagArray,
            messageId: 'invalidTestType',
            data: { allowed: TEST_TYPES.join(', ') },
          })
        }

        // UserType (1+, closed)
        const userTypes = valuesFor('@UserType')
        if (userTypes.length === 0) {
          context.report({
            node: tagArray,
            messageId: 'missingUserType',
            data: { allowed: USER_TYPES.join(', ') },
          })
        } else {
          for (const v of userTypes) {
            if (!USER_TYPES.includes(v)) {
              context.report({
                node: tagArray,
                messageId: 'invalidUserType',
                data: { allowed: USER_TYPES.join(', ') },
              })
              break
            }
          }
        }

        // Env (1+, closed)
        const envs = valuesFor('@Env')
        if (envs.length === 0) {
          context.report({
            node: tagArray,
            messageId: 'missingEnv',
            data: { allowed: ENVS.join(', ') },
          })
        } else {
          for (const v of envs) {
            if (!ENVS.includes(v)) {
              context.report({
                node: tagArray,
                messageId: 'invalidEnv',
                data: { allowed: ENVS.join(', ') },
              })
              break
            }
          }
        }

        // Product (exactly 1, closed)
        const products = valuesFor('@Product')
        if (products.length === 0) {
          context.report({
            node: tagArray,
            messageId: 'missingProduct',
            data: { allowed: PRODUCTS.join(', ') },
          })
        } else if (products.length > 1) {
          context.report({ node: tagArray, messageId: 'tooManyProduct' })
        } else if (!PRODUCTS.includes(products[0])) {
          context.report({
            node: tagArray,
            messageId: 'invalidProduct',
            data: { allowed: PRODUCTS.join(', ') },
          })
        }

        // Area (1+, format)
        const areas = tags.filter((t) => t.startsWith('@Area:'))
        if (areas.length === 0 || !areas.every((t) => AREA_RE.test(t))) {
          context.report({ node: tagArray, messageId: 'missingArea' })
        }

        // Component (1+, format)
        const components = tags.filter((t) => t.startsWith('@Component:'))
        if (
          components.length === 0 ||
          !components.every((t) => COMPONENT_RE.test(t))
        ) {
          context.report({ node: tagArray, messageId: 'missingComponent' })
        }
      },
    }
  },
}
