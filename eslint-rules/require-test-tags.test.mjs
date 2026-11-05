import { RuleTester } from 'eslint'
import tsParser from '@typescript-eslint/parser'
import rule from './require-test-tags.js'

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
})

const fullTags = [
  '@PROJ-1',
  '@Product:Google',
  '@Area:Search',
  '@Component:SearchBox',
  '@TestType:EndToEnd',
  '@UserType:Anonymous',
  '@Env:Prod',
]
const tagArray = (tags) => `[${tags.map((t) => `'${t}'`).join(', ')}]`
const testCall = (title, tags) =>
  `test('${title}', { tag: ${tagArray(tags)} }, async ({ page }) => {})`

ruleTester.run('require-test-tags', rule, {
  valid: [
    { code: testCall('Verify user can search', fullTags) },
    {
      code: testCall('Verify results', [
        '@PROJ-2',
        '@PROJ-3',
        ...fullTags.slice(1),
        '@Component:Results',
      ]),
    },
    { code: `foo('not a test', {}, () => {})` },
    {
      code: testCall('Verify with multiple areas', [
        ...fullTags,
        '@Area:Homepage',
      ]),
    },
  ],
  invalid: [
    {
      code: `test('no tags here', async ({ page }) => {})`,
      errors: [{ messageId: 'missingTagArray' }],
    },
    {
      code: testCall(
        'missing jira',
        fullTags.filter((t) => t !== '@PROJ-1'),
      ),
      errors: [{ messageId: 'missingJira' }],
    },
    {
      code: testCall('bad test type', [
        ...fullTags.filter((t) => !t.startsWith('@TestType:')),
        '@TestType:e2e',
      ]),
      errors: [{ messageId: 'invalidTestType' }],
    },
    {
      code: testCall('TEST_PROJ-69: jira in title', fullTags),
      errors: [{ messageId: 'jiraInTitle' }],
    },
  ],
})

console.log('require-test-tags: all RuleTester cases passed')
