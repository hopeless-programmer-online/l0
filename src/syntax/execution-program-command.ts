import Command from "./program-command";
import Outputs from "./execution-program-command-outputs";
import Reference from "./reference";
import Inputs from "./execution-program-command-inputs";

const OutputsClass = Outputs;
const InputsClass = Inputs;

export default class ExecutionProgramCommand extends Command {
    readonly Outputs : Outputs;
    readonly Program : Reference;
    readonly Inputs : Inputs;

    public constructor({
        Outputs = new OutputsClass,
        Program,
        Inputs  = new InputsClass,
    } : {
        Outputs? : Outputs,
        Program  : Reference,
        Inputs?  : Inputs,
    }) {
        super();

        this.Outputs = Outputs;
        this.Program = Program;
        this.Inputs = Inputs;
    }

    public toString() : string {
        const outputs = this.Outputs;
        const result = !outputs.IsEmpty
            ? `${outputs} : `
            : ``;

        return `${result}${this.Program.Name}(${this.Inputs})`;
    }
}
