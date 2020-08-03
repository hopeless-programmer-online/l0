import Command from "./command";
import Program from "./program";

export default class Commands {
    readonly program : Program;
    private list : Array<Command> = [];

    public constructor({ Program } : { Program : Program }) {
        this.program = Program;
    }
}
