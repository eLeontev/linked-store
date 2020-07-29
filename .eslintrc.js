module.exports = {
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'prettier/@typescript-eslint',
        'plugin:prettier/recommended',
    ],
    plugins: ['@typescript-eslint', 'prettier'],
    env: {
        browser: true,
        jasmine: true,
        jest: true,
        es6: true,
    },
    rules: {
        'prettier/prettier': [
            'error',
            {
                endOfLine: 'auto',
            },
        ],
        '@typescript-eslint/ban-ts-comment': 1,
        '@typescript-eslint/no-var-requires': 1,
    },
    parser: '@typescript-eslint/parser',
};
