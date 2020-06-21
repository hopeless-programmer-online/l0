import Command from "./program-command";
import Reference from "./reference";
import Inputs from "./execution-program-command-inputs";

const InputsClass = Inputs;

export default class ExecutionProgramCommand extends Command {
    readonly Program : Reference;
    readonly Inputs : Inputs;

    public constructor({
        Program,
        Inputs  = new InputsClass,
    } : {
        Program : Reference,
        Inputs? : Inputs,
    }) {
        super();

        this.Program = Program;
        this.Inputs = Inputs;
    }

    public toString() : string {
        return `${this.Program.Name}(${this.Inputs.toString()})`;
    }
}
