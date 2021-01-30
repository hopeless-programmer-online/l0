import Commands from './commands'
import Parameters from './parameters'

export default class Program {
    public readonly parameters : Parameters
    public readonly commands : Commands

    public constructor({ parameters = new Parameters, commands = new Commands } : { parameters? : Parameters, commands? : Commands } = {}) {
        this.parameters = parameters
        this.commands = commands
    }

    public toString() {
        const { commands } = this

        return `(${this.parameters}) {${
            commands.empty ? `` : commands.toString().replace(/\n/g, '\n\t')
        }\n}`
    }
}
