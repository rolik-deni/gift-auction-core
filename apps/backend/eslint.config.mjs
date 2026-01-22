// @ts-check
import eslint from '@eslint/js'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
    {
        ignores: ['eslint.config.mjs'],
    },
    eslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    eslintPluginPrettierRecommended,
    {
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.jest,
            },
            sourceType: 'module',
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        plugins: {
            'simple-import-sort': simpleImportSort,
        },
        rules: {
            'simple-import-sort/imports': 'error',
            'simple-import-sort/exports': 'error',

            'default-case': 'error',
            'no-unsafe-finally': 'off',
            camelcase: 'off',
            'max-classes-per-file': 'off',
            'no-underscore-dangle': 'off',
            'class-methods-use-this': 'off',
            'array-callback-return': 'error',
            'no-empty-pattern': 'error',
            'no-await-in-loop': 'off',
            'object-shorthand': ['error', 'always'],
            'no-restricted-syntax': 'off',

            '@typescript-eslint/no-unsafe-return': 'off',
            '@typescript-eslint/no-unused-vars': 'error',
            '@typescript-eslint/no-unsafe-call': 'off',
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/no-useless-constructor': 'off',
            '@typescript-eslint/array-type': 'error',
            '@typescript-eslint/explicit-function-return-type': 'error',
            '@typescript-eslint/explicit-member-accessibility': [
                'error',
                { accessibility: 'no-public' },
            ],

            '@typescript-eslint/naming-convention': [
                'error',
                {
                    selector: 'default',
                    format: ['camelCase'],
                },
                {
                    selector: 'variable',
                    types: ['function'],
                    format: ['camelCase', 'PascalCase'],
                },
                {
                    selector: 'variable',
                    format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
                    filter: {
                        regex: '^(.*-.*)$',
                        match: false,
                    },
                    leadingUnderscore: 'allow',
                },
                {
                    selector: 'enumMember',
                    format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
                },
                {
                    selector: 'parameter',
                    format: ['camelCase'],
                    leadingUnderscore: 'allow',
                },
                {
                    selector: 'memberLike',
                    format: ['camelCase'],
                    leadingUnderscore: 'allow',
                },
                {
                    selector: 'memberLike',
                    modifiers: ['private'],
                    format: ['camelCase'],
                    leadingUnderscore: 'require',
                },
                {
                    selector: 'typeLike',
                    format: ['PascalCase'],
                },
            ],

            '@typescript-eslint/no-explicit-any': [
                'error',
                { ignoreRestArgs: true },
            ],
            '@typescript-eslint/no-invalid-this': 'error',
            '@typescript-eslint/no-require-imports': 'error',
            '@typescript-eslint/no-for-in-array': 'error',
            '@typescript-eslint/no-misused-promises': 'error',
            '@typescript-eslint/return-await': ['error', 'always'],
            '@typescript-eslint/no-floating-promises': 'warn',
            '@typescript-eslint/no-unsafe-argument': 'warn',
            'prettier/prettier': ['warn', { endOfLine: 'auto' }],
        },
    },
)
