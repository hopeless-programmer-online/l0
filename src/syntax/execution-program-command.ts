import Command from "./program-command";
import Reference from "./reference";

export default class ExecutionProgramCommand extends Command {
    readonly Program : Reference;

    public constructor({ Program } : { Program : Reference }) {
        super();

        this.Program = Program;
    }

    public toString() : string {
        return `${this.Program.Name}()`;
    }
}
