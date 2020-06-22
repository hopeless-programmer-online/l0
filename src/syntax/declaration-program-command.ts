import Variable from "./variable";
import Program from "./program";

export default class DeclarationProgramCommand {
    readonly Variable : Variable;
    readonly Program : Program;

    public constructor({
        Variable,
        Program,
    } : {
        Variable : Variable,
        Program  : Program,
    }) {
        this.Variable = Variable;
        this.Program = Program;
    }

    public toString() : string {
        return `${this.Variable} ${this.Program}`;
    }
}
