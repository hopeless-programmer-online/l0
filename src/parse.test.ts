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
                },
            ],
        }
    })
})
it('should parse declaration with single parameter without errors', () => {
    // @todo: add expected output
    expect(() => parse(`
        f(x) {
        }
    `)).not.toThrow()
})
it('should parse declaration with two parameters without errors', () => {
    // @todo: add expected output
    expect(() => parse(`
        f(x, y) {
        }
    `)).not.toThrow()
})
it('should parse declaration with three parameters without errors', () => {
    // @todo: add expected output
    expect(() => parse(`
        f(x, y, z) {
        }
    `)).not.toThrow()
})
it('should parse execution without errors', () => {
    // @todo: add expected output
    expect(() => parse(`
        f()
    `)).not.toThrow()
})
it('should parse execution with single input without errors', () => {
    // @todo: add expected output
    expect(() => parse(`
        f(x)
    `)).not.toThrow()
})
it('should parse execution with two inputs without errors', () => {
    // @todo: add expected output
    expect(() => parse(`
        f(x, y)
    `)).not.toThrow()
})
it('should parse execution with three inputs without errors', () => {
    // @todo: add expected output
    expect(() => parse(`
        f(x, y, z)
    `)).not.toThrow()
})
it('should parse execution with single output without errors', () => {
    // @todo: add expected output
    expect(() => parse(`
        u : f()
    `)).not.toThrow()
})
it('should parse execution with two outputs without errors', () => {
    // @todo: add expected output
    expect(() => parse(`
        u, v : f()
    `)).not.toThrow()
})
it('should parse execution with three outputs without errors', () => {
    // @todo: add expected output
    expect(() => parse(`
        u, v, w : f()
    `)).not.toThrow()
})
it('should parse execution with three inputs and three outputs without errors', () => {
    // @todo: add expected output
    expect(() => parse(`
        u, v, w : f(x, y, z)
    `)).not.toThrow()
})
it('should parse nested declaration after execution without errors', () => {
    // @todo: add expected output
    expect(() => parse(`
        f() {
            f()
            g() {
            }
        }
    `)).not.toThrow()
})
it('should parse nested execution after declaration without errors', () => {
    // @todo: add expected output
    expect(() => parse(`
        f() {
            g() {
            }
            g()
        }
    `)).not.toThrow()
})
it('should parse nested execution with single output after declaration without errors', () => {
    // @todo: add expected output
    expect(() => parse(`
        f() {
            g() {
            }
            u : g()
        }
    `)).not.toThrow()
})
it('should parse nested execution with two outputs after declaration without errors', () => {
    // @todo: add expected output
    expect(() => parse(`
        f() {
            g() {
            }
            u, v : g()
        }
    `)).not.toThrow()
})
it('should parse nested execution with three outputs after declaration without errors', () => {
    // @todo: add expected output
    expect(() => parse(`
        f() {
            g() {
            }
            u, v, w : g()
        }
    `)).not.toThrow()
})
it('should parse nested declaration without errors', () => {
    // @todo: add expected output
    expect(() => parse(`
        f() {
            g() {
            }
        }
    `)).not.toThrow()
})
it('should parse nested declaration with single parameter without errors', () => {
    // @todo: add expected output
    expect(() => parse(`
        f() {
            g(x) {
            }
        }
    `)).not.toThrow()
})
it('should parse nested declaration with two parameters without errors', () => {
    // @todo: add expected output
    expect(() => parse(`
        f() {
            g(x, y) {
            }
        }
    `)).not.toThrow()
})
it('should parse nested declaration with three parameters without errors', () => {
    // @todo: add expected output
    expect(() => parse(`
        f() {
            g(x, y, z) {
            }
        }
    `)).not.toThrow()
})
it('should parse nested execution without errors', () => {
    // @todo: add expected output
    expect(() => parse(`
        f() {
            f()
        }
    `)).not.toThrow()
})
it('should parse nested execution with single input without errors', () => {
    // @todo: add expected output
    expect(() => parse(`
        f() {
            f(x)
        }
    `)).not.toThrow()
})
it('should parse nested execution with two inputs without errors', () => {
    // @todo: add expected output
    expect(() => parse(`
        f() {
            f(x, y)
        }
    `)).not.toThrow()
})
it('should parse nested execution with three inputs without errors', () => {
    // @todo: add expected output
    expect(() => parse(`
        f() {
            f(x, y, z)
        }
    `)).not.toThrow()
})
it('should parse nested execution with single output without errors', () => {
    // @todo: add expected output
    expect(() => parse(`
        f() {
            u : f()
        }
    `)).not.toThrow()
})
it('should parse nested execution with two outputs without errors', () => {
    // @todo: add expected output
    expect(() => parse(`
        f() {
            u, v : f()
        }
    `)).not.toThrow()
})
it('should parse nested execution with three outputs without errors', () => {
    // @todo: add expected output
    expect(() => parse(`
        f() {
            u, v, w : f()
        }
    `)).not.toThrow()
})
