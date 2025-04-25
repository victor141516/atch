import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
	{
		ignores: ['node_modules/**', 'dist/**', 'index.d.ts']
	},
	js.configs.recommended,
	...tseslint.configs.recommended,
	{
		languageOptions: {
			parser: tseslint.parser,
			parserOptions: {
				sourceType: 'module'
			},
			globals: {
				expect: 'readonly'
			},
			ecmaVersion: 'latest'
		},
		linterOptions: {
			reportUnusedDisableDirectives: true
		},
		rules: {
			semi: ['error', 'always'],
			'brace-style': ['error', '1tbs'],
			quotes: ['error', 'single'],
			'lines-around-comment': [
				'error',
				{
					allowBlockStart: true,
					allowObjectStart: true
				}
			],
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/explicit-function-return-type': 'off',
			'@typescript-eslint/explicit-module-boundary-types': 'off',
			'@typescript-eslint/no-empty-function': 'off',
			'@typescript-eslint/no-non-null-assertion': 'off'
		}
	}
];
