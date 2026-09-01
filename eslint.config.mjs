import eslint from '@eslint/js'
import { defineConfig, globalIgnores } from 'eslint/config'
import tseslint from 'typescript-eslint'

export default defineConfig([
  globalIgnores([
    '**/.next/**',
    '**/.open-next/**',
    '**/.turbo/**',
    '**/.venv/**',
    '**/.wrangler/**',
    '**/dist/**',
    '**/generated/**',
    '**/next-env.d.ts',
  ]),
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['apps/**/*.{ts,tsx}', 'packages/**/*.{ts,tsx}'],
    rules: {
      'no-undef': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
])
