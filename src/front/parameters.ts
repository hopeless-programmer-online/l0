import Program from "./program";
import Parameter from "./parameter";
import Explicit from "./explicit-parameter";
import Name from "../tokening/name-token";
import Super from "./super-parameter";
import Static from "./static-parameter";
import Scope from "./scope";
import Dynamic from "./dynamic-parameter";

export default class Parameters {
    private isFinalized = false;
    readonly Program : Program;
    readonly Array : Array<Parameter> = [];

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
    }

    public get Scope() : Scope {
        const array = this.Array;
        const { length } = array;

        if (length <= 0) {
            return this.Program.Scope;
        }

        return array[length - 1].Scope;
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
    public Add(name : Name | string) : Explicit {
        if (typeof name === `string`) name = Name.Plain(name);
        if (this.isFinalized) throw new Error; // @todo

        const parameter = new Explicit({ Name : name, Index : this.Explicit.length, Parent : this });

        this.Array.push(parameter);

        return parameter;
    }

    public toString() : string {
        return `(${this.Explicit.join(`, `)})`;
    }
}
