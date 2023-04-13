const off = 0;
const warn = 1;
const err = 2;

module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'airbnb/hooks',
    'airbnb-typescript',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:prettier/recommended',
    'plugin:import/recommended',
  ],
  overrides: [],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
    tsconfigRootDir: '.',
    project: ['./tsconfig.json'],
  },
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.js', '.jsx', '.ts', '.tsx'],
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: './src',
      },
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
  plugins: ['react', 'import', '@typescript-eslint', 'jsx-a11y'],
  rules: {
    'react/jsx-indent': [warn, 2, { checkAttributes: true, indentLogicalExpressions: true }],
    'react/jsx-filename-extension': [2, { extensions: ['.jsx', '.tsx'] }],
    'import/extensions': [
      err,
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],

    // rules turned off
    camelcase: off,
    'import/no-extraneous-dependencies': off,
    'no-nested-ternary': off,
    // 'no-use-before-define': off,
    'class-methods-use-this': off,
    'import/prefer-default-export': off,
    'import/no-internal-modules': off,
    'import/no-cycle': off,
    'react/react-in-jsx-scope': off,
    'react/require-default-props': off,
    'no-plusplus': off,
    'no-continue': off,
    'lines-between-class-members': off,
    '@typescript-eslint/lines-between-class-members': off,
  },
};
