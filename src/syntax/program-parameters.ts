import Parameter from "./program-parameter";
import Explicit from "./explicit-program-parameter";

export default class ProgramParameters {
    readonly Array : Array<Parameter>;

    public constructor(...array : Array<Parameter>) {
        this.Array = array;
    }

    public toString() : string {
        return this
            .Array
            .filter(parameter => parameter instanceof Explicit)
            .map(parameter => parameter as Explicit)
            .sort((a, b) => a.Index - b.Index)
            .map(explicit => explicit.Variable.Name)
            .join(`, `);
    }
}
