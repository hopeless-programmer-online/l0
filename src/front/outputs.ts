import Output from "./output";
import Execution from "./execution";
import Scope from "./scope";
import Explicit from "./explicit-output";
import Name from "../tokening/name-token";
import Sub from "./sub-output";

export default class Outputs {
    readonly Execution : Execution;
    readonly Array : Array<Output> = [];
    private scope : Scope;

    public constructor({ Execution } : { Execution : Execution }) {
        this.Execution = Execution;
        this.scope = new Scope({
            Parent : Execution.Parent.Scope,
        });

        const parameter = new Sub({ Parent : this });

        this.Array.push(parameter);
    }

    public get Scope() : Scope {
        const array = this.Array;
        const { length } = array;

        if (length <= 0) {
            return this.scope;
        }

        return array[length - 1].Scope;
    }
    public get Explicit() : Array<Explicit> {
        return this
            .Array
            .filter(parameter => parameter instanceof Explicit)
            .map(parameter => parameter as Explicit); // @todo
    }

    public Add(name : Name | string) : Explicit {
        if (typeof name === `string`) name = Name.Plain(name);
        // if (this.isFinalized) {
        //     throw new Error; // @todo
        // }

        const parent = this.Array[this.Array.length - 1];
        const output = new Explicit({ Name : name, Index : this.Explicit.length, Parent : parent });

        this.Array.push(output);

        return output;
    }

    public toString() : string {
        const array = this.Explicit;

        if (array.length <= 0) return ``;

        return `${array.join(`, `)} : `;
    }
}
