import Parameter from "./parameter";
import Program from "./program";

export default class Parameters {
    readonly program : Program;
    private set : Set<Parameter> = new Set;

    public constructor({ Program } : { Program : Program }) {
        this.program = Program;
    }
}
