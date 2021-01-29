import { parse } from './l0'

it('should parse empty string without errors', () => {
    // @todo: add expected output
    expect(() => parse(`
    `)).not.toThrow()
})
it('should parse declaration without errors', () => {
    // @todo: add expected output
    expect(() => parse(`
        f() {
        }
    `)).not.toThrow()
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
