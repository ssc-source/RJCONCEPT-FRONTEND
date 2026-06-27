import js from '@eslint/js';

export default [
  {
    ignores: ['.next/**', 'node_modules/**']
  },
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,mjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        localStorage: 'readonly',
        console: 'readonly',
        process: 'readonly',
        module: 'readonly',
        confirm: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly'
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    rules: {
      'no-unused-vars': 'off',
      'no-undef': 'off',
      'no-empty': 'off'
    }
  }
];
