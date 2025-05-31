import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import perfectionist from 'eslint-plugin-perfectionist'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      perfectionist,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      'perfectionist/sort-imports': [
        'warn',
        {
          type: 'line-length',
          order: 'desc',
          newlinesBetween: 'never',
          fallbackSort: { type: 'alphabetical', order: 'asc' },
          groups: ['type-import', 'value-import'],
        },
      ],
      'perfectionist/sort-named-imports': [
        'warn',
        {
          type: 'line-length',
          order: 'desc',
          fallbackSort: { type: 'alphabetical', order: 'asc' },
          groups: ['type-import', 'value-import'],
        },
      ],
      'perfectionist/sort-object-types': [
        'warn',
        {
          type: 'line-length',
          order: 'desc',
          fallbackSort: { type: 'alphabetical', order: 'asc' },
          groups: [
            'required-property',
            'property',
            'required-method',
            'method',
            'unknown',
          ],
        },
      ],
      'perfectionist/sort-objects': [
        'warn',
        {
          type: 'line-length',
          order: 'desc',
          fallbackSort: { type: 'alphabetical', order: 'asc' },
          groups: [
            'property',
            'method',
            'unknown',
          ],
          destructuredObjects: false,
        },
      ],
      'perfectionist/sort-jsx-props': [
        'warn',
        {
          type: 'line-length',
          order: 'desc',
          fallbackSort: { type: 'alphabetical', order: 'asc' },
          groups: ['key', 'ref', 'class', 'style', 'prop', 'event-handler', 'multiline-prop'],
          customGroups: [
            {
              groupName: 'key',
              elementNamePattern: 'key'
            },
            {
              groupName: 'class',
              elementNamePattern: 'class'
            },
            {
              groupName: 'style',
              elementNamePattern: 'style'
            },
            {
              groupName: 'ref',
              elementNamePattern: '^.*(R|r)ef$'
            },
            {
              groupName: 'event-handler',
              elementNamePattern: '^on.+'
            }
          ]
        }
      ]
    },
  },
)
