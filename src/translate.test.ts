import { parse, translate } from "./l0"
import { ExternalInstruction, TerminalInstruction, Machine } from "./back"

function run(source : string, ...params : any[]) {
    const instruction = translate(parse(source))
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
it('should translate execution without errors', () => {
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
