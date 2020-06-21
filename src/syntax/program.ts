import Parameters from "./program-parameters";
import Commands from "./program-commands";

const ParametersClass = Parameters;
const CommandsClass = Commands;

export default class Program {
    readonly Parameters : Parameters;
    readonly Commands : Commands;

    public constructor({
        Parameters = new ParametersClass,
        Commands   = new CommandsClass,
    } : {
        Parameters? : Parameters,
        Commands?   : Commands,
    } = {}) {
        this.Parameters = Parameters;
        this.Commands = Commands;
    }

    public toString() : string {
        const commands = this.Commands;
        const content = !commands.IsEmpty
            ? `\n${commands}`.replace(/\n/g, `\n\t`)
            : ``;

        return `(${this.Parameters.toString()}) {${content}\n}`;
    }
}
