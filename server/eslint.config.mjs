import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
	eslint.configs.recommended,
	...tseslint.configs.recommended,
	{
		files: ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'],
		languageOptions: {
			parser: tseslint.parser,
			parserOptions: {
				project: './tsconfig.json',
			},
		},
		plugins: {
			'@typescript-eslint': tseslint.plugin,
		},
		rules: {
			// TypeScript specific rules
			'@typescript-eslint/explicit-function-return-type': 'warn',
			'@typescript-eslint/no-unused-vars': [
				'error',
				{ argsIgnorePattern: '^_' },
			],
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/no-non-null-assertion': 'warn',

			// General JavaScript/TypeScript rules
			'no-console': ['warn', { allow: ['warn', 'error'] }],
			eqeqeq: ['error', 'always'],
			curly: ['error', 'all'],
			'prefer-const': 'error',
			'no-var': 'error',
			'object-shorthand': 'error',
			'arrow-body-style': ['error', 'as-needed'],
			'prefer-arrow-callback': 'error',
			'prefer-template': 'error',
			'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0 }],
			'comma-dangle': ['error', 'always-multiline'],
			semi: ['error', 'always'],
			quotes: ['error', 'single', { avoidEscape: true }],
		},
	},
	{
		ignores: ['dist/**', 'node_modules/**'],
	}
);
