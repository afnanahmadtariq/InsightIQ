import eslint from '@eslint/js'
import { FlatCompat } from '@eslint/eslintrc'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import tseslint from 'typescript-eslint'

const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) })

export default tseslint.config(
  {
    ignores: [
      '**/.next/**',
      '**/.open-next/**',
      '**/.turbo/**',
      '**/.wrangler/**',
      '**/dist/**',
      '**/generated/**',
      '**/next-env.d.ts',
      '**/node_modules/**',
    ],
  },
  ...compat.extends('next/core-web-vitals'),
  {
    files: ['apps/**/*.{ts,tsx}', 'packages/**/*.{ts,tsx}'],
    extends: [eslint.configs.recommended, ...tseslint.configs.recommended],
    rules: {
      'no-undef': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      // The font link lives in the App Router root layout and is site-wide;
      // the legacy pages/_document rule does not understand that topology.
      '@next/next/no-page-custom-font': 'off',
    },
  },
)
