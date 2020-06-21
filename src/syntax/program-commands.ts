import Command from "./program-command";

export default class ProgramCommands {
    readonly Array : Array<Command>;

    public constructor(...array : Array<Command>) {
        this.Array = array;
    }

    public get IsEmpty() : boolean {
        return this.Array.length <= 0;
    }

    public toString() : string {
        return this
            .Array
            .map(command => command.toString())
            .join(`\n`);
    }
}
