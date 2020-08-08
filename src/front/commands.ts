import Command from "./command";
import Program from "./program";
import Execution from "./execution";
import Scope from "./scope";

/**
 * IMPORTANT: do not add new command before finalizing previous command's scope
 */
export default class Commands {
    readonly program : Program;
    private array : Array<Command> = [];

    public constructor({ Program } : { Program : Program }) {
        this.program = Program;
    }

    public get Scope() : Scope {
        const { array } = this;

        if (array.length <= 0) {
            return this.program.Scope;
        }

        return array[array.length - 1].Scope;
    }

    public AddExecution() : Execution {
        const command = new Execution({
            Commands : this,
            Parent   : this.Scope,
        });

        this.array.push(command);

        return command;
    }

    public toString() : string {
        return `{${
            this
                .array
                .map(command => `\n${command}`)
                .join(``)
                .replace(/\n/g, `\n\t`)
        }\n}`;
    }
}
