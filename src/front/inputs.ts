import Input from "./input";
import Execution from "./execution";

export default class Inputs {
    readonly Execution : Execution;
    readonly Array : Array<Input> = [];

    public constructor({ Execution } : { Execution : Execution }) {
        this.Execution = Execution;
    }

    public Add(string : string) {
        const reference = this.Execution.Parent.Scope.Get(string);
        const output = new Input({ Reference : reference, Index : this.Array.length });

        this.Array.push(output);
    }

    public toString() : string {
        return `(${this.Array.join(`, `)})`;
    }
}
