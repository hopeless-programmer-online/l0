import Program from "./program";
import Parameter from "./parameter";
import Explicit from "./explicit-parameter";
import Name from "../tokening/name";
import NameToken from "../tokening/name-token";
import Super from "./super-parameter";
import Static from "./static-parameter";
import Scope from "./scope";
import Dynamic from "./dynamic-parameter";

export default class Parameters {
    private isFinalized = false;
    readonly Program : Program;
    readonly Array : Array<Parameter> = [];
    readonly scope : Scope;

    public constructor({ Program } : { Program : Program }) {
        this.Program = Program;

        let parent : Parameters | Parameter = this;

        if (Program.Parent) {
            const references = Program.Parent.Scope.References.Values;

            for (const reference of references) {
                const parameter : Static = new Static({
                    Reference : reference,
                    Parent    : parent,
                });

                this.Array.push(parameter);

                parent = parameter;
            }
        }

        const parameter = new Super({ Parent : parent });

        this.Array.push(parameter);

        this.scope = new Scope({ Parent : parameter.Scope });
    }

    public get Scope() : Scope {
        return this.scope;
    }
    public get Static() : Array<Static> {
        return this
            .Array
            .filter(parameter => parameter instanceof Static)
            .map(parameter => parameter as Static); // @todo
    }
    public get Dynamic() : Array<Dynamic> {
        return this
            .Array
            .filter(parameter => parameter instanceof Dynamic)
            .map(parameter => parameter as Dynamic); // @todo
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
    public Add(name : NameToken | Name | string) : Explicit {
        if (typeof name === `string`) name = Name.Plain(name);
        if (name instanceof NameToken) name = name.Name;
        // if (this.isFinalized) throw new Error; // @todo

        const parent = this.Array[this.Array.length - 1];

        const parameter = new Explicit({ Name : name, Index : this.Explicit.length, Parent : parent });

        this.Array.push(parameter);

        this.scope.Parent = parameter.Scope;

        return parameter;
    }

    public toString() : string {
        return `(${this.Explicit.join(`, `)})`;
    }
}
