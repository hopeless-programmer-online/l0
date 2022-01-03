const always = `always`
const never = `never`
const error = `error`

module.exports = {
    env           : {
        es2020           : true,
        node             : true,
        [`jest/globals`] : true,
    },
    extends       : [
        // `standard`,
    ],
    parser        : `@typescript-eslint/parser`,
    parserOptions : {
        ecmaVersion : 11,
        sourceType  : `module`,
    },
    plugins       : [
        `@typescript-eslint`,
        `jest`,
    ],
    rules         : {
        /** @see https://eslint.org/docs/rules/ */
        indent : [
            /** @see https://eslint.org/docs/rules/indent */
            error,
            4,
            {
                SwitchCase : 1,
            },
        ],
        semi   : [
            /** @see https://eslint.org/docs/rules/semi */
            error,
            always,
        ],
        quotes : [
            /** @see https://eslint.org/docs/rules/quotes */
            error,
            `backtick`,
        ],
        [`comma-dangle`] : [
            /** @see https://eslint.org/docs/rules/comma-dangle */
            error,
            `always-multiline`,
        ],
        [`array-bracket-spacing`] : [
            /** @see https://eslint.org/docs/rules/array-bracket-spacing */
            error,
            always,
            { arraysInArrays : false },
        ],
        [`key-spacing`] : [
            /** @see https://eslint.org/docs/rules/key-spacing */
            error,
            {
                beforeColon : true,
                afterColon  : true,
                align       : `colon`,
                mode        : `minimum`,
            },
        ],
        [`space-before-function-paren`] : [
            /** @see https://eslint.org/docs/rules/space-before-function-paren */
            error,
            never,
        ],
        [`new-parens`] : [
            /** @see https://eslint.org/docs/rules/new-parens */
            error,
            never,
        ],
        [`semi`] : [
            error,
            never,
        ],
        // [`lines-between-class-members`] : [
        //     /** @see https://eslint.org/docs/rules/lines-between-class-members */
        // ],
    },
}
