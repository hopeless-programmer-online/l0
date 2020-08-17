import Program from "./program";
import Parameter from "./parameter";
import Explicit from "./explicit-parameter";
import Name from "./name";
import Super from "./super-parameter";
import Declaration from "./declaration";
import StaticParameter from "./static-parameter";
import Command from "./command";
import Commands from "./commands";
import Scope from "./scope";

export default class Parameters {
    private isFinalized = false;
    readonly Program : Program;
    readonly Array : Array<Parameter> = [];

    public constructor({ Program } : { Program : Program }) {
        this.Program = Program;

        let parent : Parameters | Parameter = this;

        if (Program.Parent) {
            const references = Program.Parent.Scope.References.values();

            for (const reference of references) {
                const parameter : StaticParameter = new StaticParameter({
                    Reference : reference,
                    Parent    : parent,
                });

                this.Array.push(parameter);

                parent = parameter;
            }
        }

        const parameter = new Super({ Parent : parent });

        this.Array.push(parameter);
    }

    public get Scope() : Scope {
        const array = this.Array;
        const { length } = array;

        if (length <= 0) {
            return this.Program.Scope;
        }

        return array[length - 1].Scope;
    }
    public get Explicit() : Array<Explicit> {
        return this
            .Array
            .filter(parameter => parameter instanceof Explicit)
            .map(parameter => parameter as Explicit); // @todo
    }

    public Finalize() {
        if (this.isFinalized) {
            throw new Error; // @todo
        }

        this.isFinalized = true;
    }
    public Add(string : string) : Explicit {
        if (this.isFinalized) {
            throw new Error; // @todo
        }

        const name = new Name({ String : string });
        const parameter = new Explicit({ Name : name, Index : this.Explicit.length, Parent : this });

        this.Array.push(parameter);

        return parameter;
    }

    public toString() : string {
        return `(${this.Explicit.join(`, `)})`;
    }
}
