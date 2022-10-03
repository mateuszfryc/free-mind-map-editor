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
        'plugin:react/recommended',
        'airbnb',
        'airbnb/hooks',
        'plugin:@typescript-eslint/recommended',
        'plugin:jsx-a11y/recommended',
        'prettier',
    ],
    overrides: [],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
    },
    settings: {
        'import/parsers': {
            '@typescript-eslint/parser': ['.js', '.jsx', '.ts', '.tsx'],
        },
        'import/resolver': {
            typescript: {
                alwaysTryTypes: true,
            },
            node: {
                extensions: ['.js', '.jsx', '.ts', '.tsx'],
            },
        },
    },
    plugins: ['react', 'import', '@typescript-eslint', 'jsx-a11y'],
    rules: {
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
        'class-methods-use-this': off,
        'import/prefer-default-export': off,
        'import/no-internal-modules': off,
        'import/no-cycle': off,
        'react/react-in-jsx-scope': off,
        'react/require-default-props': off,
        'no-plusplus': off,
        'no-continue': off,
        camelcase: off,
        'lines-between-class-members': off,
        '@typescript-eslint/lines-between-class-members': off,
    },
};
