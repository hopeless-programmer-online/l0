import Commands from './commands'
import Declaration from './declaration'
import Name from './name'
import Program from './program'

it('should stringify without commands', () => {
    expect((new Commands).toString()).toBe('')
})
it('should stringify with single declaration', () => {
    const commands = new Commands({ array : [
        new Declaration({ name : Name.From('f'), program : new Program }),
    ] })

    expect(commands.toString()).toBe(
        'f () {\n' +
        '}' +
    '')
})
it('should stringify with two declarations', () => {
    const commands = new Commands({ array : [
        new Declaration({ name : Name.From('f'), program : new Program }),
        new Declaration({ name : Name.From('g'), program : new Program }),
    ] })

    expect(commands.toString()).toBe(
        'f () {\n' +
        '}\n' +
        'g () {\n' +
        '}' +
    '')
})
