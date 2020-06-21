import Output from "./execution-program-command-output";
import Explicit from "./explicit-execution-program-command-output";

export default class ExecutionProgramCommandOutputs {
    readonly Array : Array<Output>;

    public constructor(...array : Array<Output>) {
        this.Array = array;
    }

    public get IsEmpty() : boolean {
        return this.Array.length <= 0;
    }

    public toString() : string {
        return this
            .Array
            .filter(output => output instanceof Explicit)
            .map(output => output as Explicit)
            .sort((a, b) => a.Index - b.Index)
            .join(`, `);
    }
}
