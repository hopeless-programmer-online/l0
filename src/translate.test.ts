import { parse, translate } from "./l0"
import { ExternalInstruction, TerminalInstruction, Machine } from "./back"

function run(source : string, ...params : any[]) {
    const program = parse(source)
    const instruction = translate(program)
    const machine = new Machine({ buffer : [
        instruction,
        ...params,
    ] })

    while (!(machine.instruction instanceof TerminalInstruction)) machine.step()
}

it('should translate empty string without errors', () => {
    expect(() => run(`
    `)).not.toThrow()
})
it('should translate declaration without errors', () => {
    expect(() => run(`
        f() {
        }
    `)).not.toThrow()
})
it('should translate execution without errors', () => {
    let counter = 0

    const f = new ExternalInstruction({ callback : (buffer : any[]) => {
        ++counter

        return [ buffer[1], buffer[1] ]
    } })

    expect(() => run(`
        f()
    `, f)).not.toThrow()

    expect(counter).toBe(1)
})
it('should translate two sequential executions without errors', () => {
    let counter = 0

    const f = new ExternalInstruction({ callback : (buffer : any[]) => {
        ++counter

        return [ buffer[1], buffer[1] ]
    } })

    expect(() => run(`
        f()
        f()
    `, f)).not.toThrow()

    expect(counter).toBe(2)
})
it('should translate execution with input without errors', () => {
    let counter = 0
    let value;

    const f = new ExternalInstruction({ callback : (buffer : any[]) => {
        ++counter

        value = buffer[2]

        return [ buffer[1], buffer[1] ]
    } })

    expect(() => run(`
        f(1)
    `, f, 1)).not.toThrow()

    expect(counter).toBe(1)
    expect(value).toBe(1)
})
it('should translate execution with input without errors', () => {
    let value;

    const f = new ExternalInstruction({ callback : (buffer : any[]) => {
        return [ buffer[1], buffer[1], 5 ]
    } })
    const g = new ExternalInstruction({ callback : (buffer : any[]) => {
        value = buffer[2]

        return [ buffer[1], buffer[1] ]
    } })

    expect(() => run(`
        x : f()
        g(x)
    `, f, g)).not.toThrow()

    expect(value).toBe(5)
})
it('should translate execution of empty declared program without errors', () => {
    expect(() => run(`
        f() {
        }
        f()
    `)).not.toThrow()
})
it('should translate return from outer program', () => {
    expect(() => run(`
        f() {
            g() {
                /super()
            }
            g()
        }

        f()
    `)).not.toThrow()
})
