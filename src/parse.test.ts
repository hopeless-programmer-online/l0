import { parse } from './l0'

function check({ source, expected } : { source : string, expected : any }) {
    const actual = parse(source)

    // console.log(actual)

    function wrap(expected : any, actual : any) : any {
        if (expected === null || typeof expected !== 'object') return actual
        if (Array.isArray(expected)) {
            if (typeof actual !== 'object') return actual
            if (!actual[Symbol.iterator]) return actual

            const values = [ ...actual ]
            const mapped = []

            for (let i = 0; i < Math.max(values.length, expected.length); ++i) {
                mapped.push(wrap( expected[i] , values[i] ))
            }

            return mapped
        }

        const dummy : any = {}

        if (typeof actual === 'object') {
            for (const [ key, value ] of Object.entries(expected)) {
                dummy[key] = wrap(value, actual[key])
            }
        }

        return dummy
    }

    const wrapped = wrap(expected, actual)

    expect(wrapped).toMatchObject(expected)
}

it('should parse empty string without errors', () => {
    check({
        source: `
        `,
        expected: {
            parameters : [
                { name : { text : 'super' } },
            ],
            commands : [],
        }
    })
})
it('should parse declaration without errors', () => {
    check({
        source: `
            f() {
            }
        `,
        expected: {
            parameters : [
                { name : { text : 'super' } },
            ],
            commands : [
                {
                    name : { text : 'f' },
                    program : {
                        parameters : [
                            { name : { text : 'super' } },
                        ],
                        commands : [],
                    },
                },
            ],
        },
    })
})
it('should parse declaration with single parameter without errors', () => {
    check({
        source: `
            f(x) {
            }
        `,
        expected: {
            parameters : [
                { name : { text : 'super' } },
            ],
            commands : [
                {
                    name : { text : 'f' },
                    program : {
                        parameters : [
                            { name : { text : 'super' } },
                            { name : { text : 'x' } },
                        ],
                        commands : [],
                    },
                },
            ],
        },
    })
})
it('should parse declaration with two parameters without errors', () => {
    check({
        source: `
            f(x, y) {
            }
        `,
        expected: {
            parameters : [
                { name : { text : 'super' } },
            ],
            commands : [
                {
                    name : { text : 'f' },
                    program : {
                        parameters : [
                            { name : { text : 'super' } },
                            { name : { text : 'x' } },
                            { name : { text : 'y' } },
                        ],
                        commands : [],
                    },
                },
            ],
        },
    })
})
it('should parse declaration with three parameters without errors', () => {
    check({
        source: `
            f(x, y, z) {
            }
        `,
        expected: {
            parameters : [
                { name : { text : 'super' } },
            ],
            commands : [
                {
                    name : { text : 'f' },
                    program : {
                        parameters : [
                            { name : { text : 'super' } },
                            { name : { text : 'x' } },
                            { name : { text : 'y' } },
                            { name : { text : 'z' } },
                        ],
                        commands : [],
                    },
                },
            ],
        },
    })
})
it('should parse execution without errors', () => {
    check({
        source: `
            f()
        `,
        expected: {
            parameters : [
                { name : { text : 'super' } },
                { name : { text : 'f' } },
            ],
            commands : [
                {
                    target : { name : { text : 'f' } },
                    inputs : [],
                    outputs : [
                        { name : { text : 'sub' } },
                    ],
                },
            ],
        },
    })
})
it('should parse execution with single input without errors', () => {
    check({
        source: `
            f(x)
        `,
        expected: {
            parameters : [
                { name : { text : 'super' } },
                { name : { text : 'f' } },
                { name : { text : 'x' } },
            ],
            commands : [
                {
                    target : { name : { text : 'f' } },
                    inputs : [
                        { name : { text : 'x' } },
                    ],
                    outputs : [
                        { name : { text : 'sub' } },
                    ],
                },
            ],
        },
    })
})
it('should parse execution with two inputs without errors', () => {
    check({
        source: `
            f(x, y)
        `,
        expected: {
            parameters : [
                { name : { text : 'super' } },
                { name : { text : 'f' } },
                { name : { text : 'x' } },
                { name : { text : 'y' } },
            ],
            commands : [
                {
                    target : { name : { text : 'f' } },
                    inputs : [
                        { name : { text : 'x' } },
                        { name : { text : 'y' } },
                    ],
                    outputs : [
                        { name : { text : 'sub' } },
                    ],
                },
            ],
        },
    })
})
it('should parse execution with three inputs without errors', () => {
    check({
        source: `
            f(x, y, z)
        `,
        expected: {
            parameters : [
                { name : { text : 'super' } },
                { name : { text : 'f' } },
                { name : { text : 'x' } },
                { name : { text : 'y' } },
                { name : { text : 'z' } },
            ],
            commands : [
                {
                    target : { name : { text : 'f' } },
                    inputs : [
                        { name : { text : 'x' } },
                        { name : { text : 'y' } },
                        { name : { text : 'z' } },
                    ],
                    outputs : [
                        { name : { text : 'sub' } },
                    ],
                },
            ],
        },
    })
})
it('should parse execution with single output without errors', () => {
    check({
        source: `
            u : f()
        `,
        expected: {
            parameters : [
                { name : { text : 'super' } },
                { name : { text : 'f' } },
            ],
            commands : [
                {
                    target : { name : { text : 'f' } },
                    inputs : [],
                    outputs : [
                        { name : { text : 'sub' } },
                        { name : { text : 'u' } },
                    ],
                },
            ],
        },
    })
})
it('should parse execution with two outputs without errors', () => {
    check({
        source: `
            u, v : f()
        `,
        expected: {
            parameters : [
                { name : { text : 'super' } },
                { name : { text : 'f' } },
            ],
            commands : [
                {
                    target : { name : { text : 'f' } },
                    inputs : [],
                    outputs : [
                        { name : { text : 'sub' } },
                        { name : { text : 'u' } },
                        { name : { text : 'v' } },
                    ],
                },
            ],
        },
    })
})
it('should parse execution with three outputs without errors', () => {
    check({
        source: `
            u, v, w : f()
        `,
        expected: {
            parameters : [
                { name : { text : 'super' } },
                { name : { text : 'f' } },
            ],
            commands : [
                {
                    target : { name : { text : 'f' } },
                    inputs : [],
                    outputs : [
                        { name : { text : 'sub' } },
                        { name : { text : 'u' } },
                        { name : { text : 'v' } },
                        { name : { text : 'w' } },
                    ],
                },
            ],
        },
    })

})
it('should parse execution with three inputs and three outputs without errors', () => {
    check({
        source: `
            u, v, w : f(x, y, z)
        `,
        expected: {
            parameters : [
                { name : { text : 'super' } },
                { name : { text : 'f' } },
                { name : { text : 'x' } },
                { name : { text : 'y' } },
                { name : { text : 'z' } },
            ],
            commands : [
                {
                    target : { name : { text : 'f' } },
                    inputs : [
                        { name : { text : 'x' } },
                        { name : { text : 'y' } },
                        { name : { text : 'z' } },
                    ],
                    outputs : [
                        { name : { text : 'sub' } },
                        { name : { text : 'u' } },
                        { name : { text : 'v' } },
                        { name : { text : 'w' } },
                    ],
                },
            ],
        },
    })

})
it('should parse nested declaration after execution without errors', () => {
    check({
        source: `
            f() {
                f()
                g() {
                }
            }
        `,
        expected: {
            parameters : [
                { name : { text : 'super' } },
            ],
            commands : [
                {
                    name : { text : 'f' },
                    program : {
                        parameters: [
                            { name : { text : 'super' } },
                        ],
                        commands : [
                            {
                                target : { name : { text : 'f' } },
                                inputs : [],
                                outputs : [
                                    { name : { text : 'sub' } },
                                ],
                            },
                            {
                                name : { text : 'g' },
                                program : {
                                    parameters: [
                                        { name : { text : 'super' } },
                                    ],
                                    commands: [],
                                },
                            },
                        ],
                    },
                },
            ],
        },
    })
})
it('should parse nested execution after declaration without errors', () => {
    check({
        source: `
            f() {
                g() {
                }
                g()
            }
        `,
        expected: {
            parameters : [
                { name : { text : 'super' } },
            ],
            commands : [
                {
                    name : { text : 'f' },
                    program : {
                        parameters: [
                            { name : { text : 'super' } },
                        ],
                        commands : [
                            {
                                name : { text : 'g' },
                                program : {
                                    parameters: [
                                        { name : { text : 'super' } },
                                    ],
                                    commands: [],
                                },
                            },
                            {
                                target : { name : { text : 'g' } },
                                inputs : [],
                                outputs : [
                                    { name : { text : 'sub' } },
                                ],
                            },
                        ],
                    },
                },
            ],
        },
    })
})
it('should parse nested execution with single output after declaration without errors', () => {
    check({
        source: `
            f() {
                g() {
                }
                u : g()
            }
        `,
        expected: {
            parameters : [
                { name : { text : 'super' } },
            ],
            commands : [
                {
                    name : { text : 'f' },
                    program : {
                        parameters: [
                            { name : { text : 'super' } },
                        ],
                        commands : [
                            {
                                name : { text : 'g' },
                                program : {
                                    parameters: [
                                        { name : { text : 'super' } },
                                    ],
                                    commands: [],
                                },
                            },
                            {
                                target : { name : { text : 'g' } },
                                inputs : [],
                                outputs : [
                                    { name : { text : 'sub' } },
                                    { name : { text : 'u' } },
                                ],
                            },
                        ],
                    },
                },
            ],
        },
    })
})
it('should parse nested execution with two outputs after declaration without errors', () => {
    check({
        source: `
            f() {
                g() {
                }
                u, v : g()
            }
        `,
        expected: {
            parameters : [
                { name : { text : 'super' } },
            ],
            commands : [
                {
                    name : { text : 'f' },
                    program : {
                        parameters: [
                            { name : { text : 'super' } },
                        ],
                        commands : [
                            {
                                name : { text : 'g' },
                                program : {
                                    parameters: [
                                        { name : { text : 'super' } },
                                    ],
                                    commands: [],
                                },
                            },
                            {
                                target : { name : { text : 'g' } },
                                inputs : [],
                                outputs : [
                                    { name : { text : 'sub' } },
                                    { name : { text : 'u' } },
                                    { name : { text : 'v' } },
                                ],
                            },
                        ],
                    },
                },
            ],
        },
    })
})
it('should parse nested execution with three outputs after declaration without errors', () => {
    check({
        source: `
            f() {
                g() {
                }
                u, v, w : g()
            }
        `,
        expected: {
            parameters : [
                { name : { text : 'super' } },
            ],
            commands : [
                {
                    name : { text : 'f' },
                    program : {
                        parameters: [
                            { name : { text : 'super' } },
                        ],
                        commands : [
                            {
                                name : { text : 'g' },
                                program : {
                                    parameters: [
                                        { name : { text : 'super' } },
                                    ],
                                    commands: [],
                                },
                            },
                            {
                                target : { name : { text : 'g' } },
                                inputs : [],
                                outputs : [
                                    { name : { text : 'sub' } },
                                    { name : { text : 'u' } },
                                    { name : { text : 'v' } },
                                    { name : { text : 'w' } },
                                ],
                            },
                        ],
                    },
                },
            ],
        },
    })
})
it('should parse nested declaration without errors', () => {
    check({
        source: `
            f() {
                g() {
                }
            }
        `,
        expected: {
            parameters : [
                { name : { text : 'super' } },
            ],
            commands : [
                {
                    name : { text : 'f' },
                    program : {
                        parameters: [
                            { name : { text : 'super' } },
                        ],
                        commands : [
                            {
                                name : { text : 'g' },
                                program : {
                                    parameters: [
                                        { name : { text : 'super' } },
                                    ],
                                    commands: [],
                                },
                            },
                        ],
                    },
                },
            ],
        },
    })
})
it('should parse nested declaration with single parameter without errors', () => {
    check({
        source: `
            f() {
                g(x) {
                }
            }
        `,
        expected: {
            parameters : [
                { name : { text : 'super' } },
            ],
            commands : [
                {
                    name : { text : 'f' },
                    program : {
                        parameters: [
                            { name : { text : 'super' } },
                        ],
                        commands : [
                            {
                                name : { text : 'g' },
                                program : {
                                    parameters: [
                                        { name : { text : 'super' } },
                                        { name : { text : 'x' } },
                                    ],
                                    commands: [],
                                },
                            },
                        ],
                    },
                },
            ],
        },
    })
})
it('should parse nested declaration with two parameters without errors', () => {
    check({
        source: `
            f() {
                g(x, y) {
                }
            }
        `,
        expected: {
            parameters : [
                { name : { text : 'super' } },
            ],
            commands : [
                {
                    name : { text : 'f' },
                    program : {
                        parameters: [
                            { name : { text : 'super' } },
                        ],
                        commands : [
                            {
                                name : { text : 'g' },
                                program : {
                                    parameters: [
                                        { name : { text : 'super' } },
                                        { name : { text : 'x' } },
                                        { name : { text : 'y' } },
                                    ],
                                    commands: [],
                                },
                            },
                        ],
                    },
                },
            ],
        },
    })
})
it('should parse nested declaration with three parameters without errors', () => {
    check({
        source: `
            f() {
                g(x, y, z) {
                }
            }
        `,
        expected: {
            parameters : [
                { name : { text : 'super' } },
            ],
            commands : [
                {
                    name : { text : 'f' },
                    program : {
                        parameters: [
                            { name : { text : 'super' } },
                        ],
                        commands : [
                            {
                                name : { text : 'g' },
                                program : {
                                    parameters: [
                                        { name : { text : 'super' } },
                                        { name : { text : 'x' } },
                                        { name : { text : 'y' } },
                                        { name : { text : 'z' } },
                                    ],
                                    commands: [],
                                },
                            },
                        ],
                    },
                },
            ],
        },
    })
})
it('should parse nested execution without errors', () => {
    check({
        source: `
            f() {
                f()
            }
        `,
        expected: {
            parameters : [
                { name : { text : 'super' } },
            ],
            commands : [
                {
                    name : { text : 'f' },
                    program : {
                        parameters: [
                            { name : { text : 'super' } },
                        ],
                        commands : [
                            {
                                target : { name : { text : 'f' } },
                                inputs : [],
                                outputs : [
                                    { name : { text : 'sub' } },
                                ],
                            },
                        ],
                    },
                },
            ],
        },
    })
})
it('should parse nested execution with single input without errors', () => {
    check({
        source: `
            f() {
                f(x)
            }
        `,
        expected: {
            parameters : [
                { name : { text : 'super' } },
                { name : { text : 'x' } },
            ],
            commands : [
                {
                    name : { text : 'f' },
                    program : {
                        parameters: [
                            { name : { text : 'super' } },
                        ],
                        commands : [
                            {
                                target : { name : { text : 'f' } },
                                inputs : [
                                    { name : { text : 'x' } },
                                ],
                                outputs : [
                                    { name : { text : 'sub' } },
                                ],
                            },
                        ],
                    },
                },
            ],
        },
    })
})
it('should parse nested execution with two inputs without errors', () => {
    check({
        source: `
            f() {
                f(x, y)
            }
        `,
        expected: {
            parameters : [
                { name : { text : 'super' } },
                { name : { text : 'x' } },
                { name : { text : 'y' } },
            ],
            commands : [
                {
                    name : { text : 'f' },
                    program : {
                        parameters: [
                            { name : { text : 'super' } },
                        ],
                        commands : [
                            {
                                target : { name : { text : 'f' } },
                                inputs : [
                                    { name : { text : 'x' } },
                                    { name : { text : 'y' } },
                                ],
                                outputs : [
                                    { name : { text : 'sub' } },
                                ],
                            },
                        ],
                    },
                },
            ],
        },
    })
})
it('should parse nested execution with three inputs without errors', () => {
    check({
        source: `
            f() {
                f(x, y, z)
            }
        `,
        expected: {
            parameters : [
                { name : { text : 'super' } },
                { name : { text : 'x' } },
                { name : { text : 'y' } },
                { name : { text : 'z' } },
            ],
            commands : [
                {
                    name : { text : 'f' },
                    program : {
                        parameters: [
                            { name : { text : 'super' } },
                        ],
                        commands : [
                            {
                                target : { name : { text : 'f' } },
                                inputs : [
                                    { name : { text : 'x' } },
                                    { name : { text : 'y' } },
                                    { name : { text : 'z' } },
                                ],
                                outputs : [
                                    { name : { text : 'sub' } },
                                ],
                            },
                        ],
                    },
                },
            ],
        },
    })
})
it('should parse nested execution with single output without errors', () => {
    check({
        source: `
            f() {
                u : f()
            }
        `,
        expected: {
            parameters : [
                { name : { text : 'super' } },
            ],
            commands : [
                {
                    name : { text : 'f' },
                    program : {
                        parameters: [
                            { name : { text : 'super' } },
                        ],
                        commands : [
                            {
                                target : { name : { text : 'f' } },
                                inputs : [],
                                outputs : [
                                    { name : { text : 'sub' } },
                                    { name : { text : 'u' } },
                                ],
                            },
                        ],
                    },
                },
            ],
        },
    })
})
it('should parse nested execution with two outputs without errors', () => {
    check({
        source: `
            f() {
                u, v : f()
            }
        `,
        expected: {
            parameters : [
                { name : { text : 'super' } },
            ],
            commands : [
                {
                    name : { text : 'f' },
                    program : {
                        parameters: [
                            { name : { text : 'super' } },
                        ],
                        commands : [
                            {
                                target : { name : { text : 'f' } },
                                inputs : [],
                                outputs : [
                                    { name : { text : 'sub' } },
                                    { name : { text : 'u' } },
                                    { name : { text : 'v' } },
                                ],
                            },
                        ],
                    },
                },
            ],
        },
    })
})
it('should parse nested execution with three outputs without errors', () => {
    check({
        source: `
            f() {
                u, v, w : f()
            }
        `,
        expected: {
            parameters : [
                { name : { text : 'super' } },
            ],
            commands : [
                {
                    name : { text : 'f' },
                    program : {
                        parameters: [
                            { name : { text : 'super' } },
                        ],
                        commands : [
                            {
                                target : { name : { text : 'f' } },
                                inputs : [],
                                outputs : [
                                    { name : { text : 'sub' } },
                                    { name : { text : 'u' } },
                                    { name : { text : 'v' } },
                                    { name : { text : 'w' } },
                                ],
                            },
                        ],
                    },
                },
            ],
        },
    })
})
it('should parse two sequential declarations with different names without errors', () => {
    check({
        source: `
            f() {
            }
            g() {
            }
        `,
        expected: {
            parameters : [
                { name : { text : 'super' } },
            ],
            commands : [
                {
                    name : { text : 'f' },
                    program : {
                        parameters : [
                            { name : { text : 'super' } },
                        ],
                        commands : [],
                    },
                },
                {
                    name : { text : 'g' },
                    program : {
                        parameters : [
                            { name : { text : 'super' } },
                        ],
                        commands : [],
                    },
                },
            ],
        },
    })
})
it('should parse two sequential declarations with same names without errors', () => {
    check({
        source: `
            f() {
            }
            f() {
            }
        `,
        expected: {
            parameters : [
                { name : { text : 'super' } },
            ],
            commands : [
                {
                    name : { text : 'f' },
                    program : {
                        parameters : [
                            { name : { text : 'super' } },
                        ],
                        commands : [],
                    },
                },
                {
                    name : { text : 'f' },
                    program : {
                        parameters : [
                            { name : { text : 'super' } },
                        ],
                        commands : [],
                    },
                },
            ],
        },
    })
})
it('should parse two sequential executions of undeclared programs without errors', () => {
    check({
        source: `
            f()
            f()
        `,
        expected: {
            parameters : [
                { name : { text : 'super' } },
                { name : { text : 'f' } },
            ],
            commands : [
                {
                    target : { name : { text : 'f' } },
                    inputs : [],
                    outputs : [
                        { name : { text : 'sub' } },
                    ],
                },
                {
                    target : { name : { text : 'f' } },
                    inputs : [],
                    outputs : [
                        { name : { text : 'sub' } },
                    ],
                },
            ],
        },
    })
})
it('should parse two nested sequential executions of undeclared programs without errors', () => {
    check({
        source: `
            a() {
                f()
                f()
            }
        `,
        expected: {
            parameters : [
                { name : { text : 'super' } },
                { name : { text : 'f' } },
            ],
            commands : [
                {
                    name : { text : 'a' },
                    program : {
                        parameters : [
                            { name : { text : 'super' } },
                        ],
                        commands : [
                            {
                                target : { name : { text : 'f' } },
                                inputs : [],
                                outputs : [
                                    { name : { text : 'sub' } },
                                ],
                            },
                            {
                                target : { name : { text : 'f' } },
                                inputs : [],
                                outputs : [
                                    { name : { text : 'sub' } },
                                ],
                            },
                        ],
                    },
                },
            ],
        },
    })
})
it('should parse two sequential executions of undeclared programs inside separate declarations without errors', () => {
    check({
        source: `
            a() {
                f()
            }
            b() {
            }
        `,
        expected: {
            parameters : [
                { name : { text : 'super' } },
                { name : { text : 'f' } },
            ],
            commands : [
                {
                    name : { text : 'a' },
                    program : {
                        parameters : [
                            { name : { text : 'super' } },
                        ],
                        commands : [
                            {
                                target : { name : { text : 'f' } },
                                inputs : [],
                                outputs : [
                                    { name : { text : 'sub' } },
                                ],
                            },
                            // {
                            //     target : { name : { text : 'f' } },
                            //     inputs : [],
                            //     outputs : [
                            //         { name : { text : 'sub' } },
                            //     ],
                            // },
                        ],
                    },
                },
                {
                    name : { text : 'b' },
                    program : {
                        parameters : [
                            { name : { text : 'super' } },
                        ],
                        commands : [
                            // {
                            //     target : { name : { text : 'f' } },
                            //     inputs : [],
                            //     outputs : [
                            //         { name : { text : 'sub' } },
                            //     ],
                            // },
                            // {
                            //     target : { name : { text : 'f' } },
                            //     inputs : [],
                            //     outputs : [
                            //         { name : { text : 'sub' } },
                            //     ],
                            // },
                        ],
                    },
                },
            ],
        },
    })
})
