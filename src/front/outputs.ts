import Execution from "./execution";
import Output from "./output";
import Scope from "./scope";
import Explicit from "./explicit-output";
import Name from "./name";

export default class Outputs {
    private execution : Execution;
    private array : Array<Output> = [];

    public constructor({ Execution } : { Execution : Execution }) {
        this.execution = Execution;
    }

    public get IsEmpty() : boolean {
        return this.array.length <= 0;
    }
    public get Scope() : Scope {
        const { array } = this;

        if (array.length <= 0) {
            return this.execution.Parent;
        }

        return array[array.length - 1].Scope;
    }
    public get Explicit() : Array<Explicit> {
        return this.array
            .filter(parameter => parameter instanceof Explicit)
            .map(parameter => parameter as Explicit)
            .sort((a, b) => b.Index - a.Index);
    }

    public AddExplicit(string : string) : Explicit {
        const parameter = new Explicit({
            Parent  : this.Scope,
            Outputs : this,
            Name    : new Name({ String : string }),
            Index      : this.Explicit.length,
        });

        this.array.push(parameter);

        return parameter;
    }

    public toString() : string {
        if (this.IsEmpty) {
            return ``;
        }

        return this.array.join(`, `);
    }
}
