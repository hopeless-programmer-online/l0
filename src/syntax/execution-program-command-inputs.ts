import Input from "./execution-program-command-input";
import Explicit from "./explicit-execution-program-command-input";

export default class ExecutionProgramCommandInputs {
    readonly Array : Array<Input>;

    public constructor(...array : Array<Input>) {
        this.Array = array;
    }

    public toString() : string {
        return this
            .Array
            .filter(input => input instanceof Explicit)
            .map(input => input as Explicit)
            .sort((a, b) => a.Index - b.Index)
            .join(`, `);
    }
}
