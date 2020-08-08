import Execution from "./execution";
import Input from "./input";

export default class Inputs {
    private execution : Execution;
    private array : Array<Input> = [];

    public constructor({ Execution } : { Execution : Execution }) {
        this.execution = Execution;
    }

    public Add(string : string) : Input {
        const input = new Input({
            Inputs    : this,
            Reference : this.execution.Scope.GetName(string),
            Index     : this.array.length,
        });

        this.array.push(input);

        return input;
    }

    public toString() : string {
        return `(${this.array.join(`, `)})`;
    }
}
