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

            return expected.map((x,i) => wrap(x, values[i]) )
        }

        const dummy : any = {}

        if (typeof actual === 'object') {
            for (const [ key, value ] of Object.entries(expected)) {
                dummy[key] = wrap(value, actual[key])
            }
        }

        return dummy
    }

    expect(wrap(expected, actual)).toMatchObject(expected)
}

it('should parse empty string without errors', () => {
    check({
        source: `
        `,
        expected: {
            parameters : [],
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
            parameters : [],
            commands : [
                {
                    name : { text : 'f' },
                    program : {
                        parameters : [],
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
            parameters : [],
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
            parameters : [],
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
            parameters : [],
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
            parameters : [],
            commands : [
                {
                    target : { name : { text : 'f' } },
                    inputs : [],
                    outputs : [],
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
            parameters : [],
            commands : [
                {
                    target : { name : { text : 'f' } },
                    inputs : [
                        { name : { text : 'x' } },
                    ],
                    outputs : [],
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
            parameters : [],
            commands : [
                {
                    target : { name : { text : 'f' } },
                    inputs : [
                        { name : { text : 'x' } },
                        { name : { text : 'y' } },
                    ],
                    outputs : [],
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
            parameters : [],
            commands : [
                {
                    target : { name : { text : 'f' } },
                    inputs : [
                        { name : { text : 'x' } },
                        { name : { text : 'y' } },
                        { name : { text : 'z' } },
                    ],
                    outputs : [],
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
            parameters : [],
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
            parameters : [],
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
            parameters : [],
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
            parameters : [],
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
            parameters : [],
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
                                outputs : [],
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
            parameters : [],
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
            parameters : [],
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
            parameters : [],
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
            parameters : [],
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
            parameters : [],
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
            parameters : [],
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
            parameters : [],
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
            parameters : [],
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
            parameters : [],
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
            parameters : [],
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
            parameters : [],
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
            parameters : [],
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
