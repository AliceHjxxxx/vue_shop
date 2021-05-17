module.exports = {
    root: true,
    env: {
        node: true
    },
    'extends': [
        'plugin:vue/essential',
        '@vue/standard'
    ],
    rules: {
        'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'space-before-function-paren': 0,
        'quotes': 'off',
        'semi': 'off',
        'comma-dangle': 'off',
        'no-empty': 'off',
        'no-regex-spaces': 'off',
        'indent': 'off',
        'eol-last': 'off',
        'func-call-spacing': 'off',
        'spaced-comment': 'off',
        'no-trailing-spaces': 'off',
        'space-before-blocks': 'off',
        'space-before-blocks': 'off',
        'quote-props': 'off',
        'no-useless-return': 'off',
        'no-unused-vars': 'off'

    },
    parserOptions: {
        parser: 'babel-eslint'
    }
}