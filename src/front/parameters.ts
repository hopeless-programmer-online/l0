import Program from "./program";
import Explicit from "./explicit-parameter";
import Name from "../tokening/name";
import NameToken from "../tokening/name-token";
import Super from "./super-parameter";
import Static from "./static-parameter";
import Scope from "./scope";
import Dynamic from "./dynamic-parameter";
import Reference from "./reference";

export default class Parameters {
    readonly Program : Program;
    readonly Static : Array<Static> = [];
    readonly Dynamic : Array<Dynamic> = [];
    readonly Explicit : Array<Explicit> = [];
    readonly EntryScope = new Scope;
    readonly StaticScope : Scope;
    readonly DynamicScope : Scope;
    readonly ExplicitScope : Scope;

    public constructor({ Program } : { Program : Program }) {
        this.Program = Program;
        this.StaticScope = new Scope;

        if (Program.Parent) {
            const references = Program.Parent.Scope.References.Values;

            for (const reference of references) this.AddStatic(reference);
        }

        const parameter = new Super({ Parent : this.StaticScope });

        this.Dynamic.push(parameter);

        this.DynamicScope = new Scope({ Parent : parameter.Scope });
        this.ExplicitScope = new Scope({ Parent : this.DynamicScope });
    }

    public * [Symbol.iterator]() {
        yield * this.Static;
        yield * this.Dynamic;
        yield * this.Explicit;
    }

    public AddStatic(reference : Reference) {
        const parameter : Static = new Static({
            Target : reference,
            Parent : this.Static.length > 0
                ? this.Static[this.Static.length - 1].Scope
                : this.EntryScope,
        });

        this.StaticScope.Parent = parameter.Scope;

        this.Static.push(parameter);

        return parameter;
    }
    public Add(name : NameToken | Name | string) {
        if (typeof name === `string`) name = Name.Plain(name);
        if (name instanceof NameToken) name = name.Name;

        const parameter = new Explicit({
            Name   : name,
            Index  : this.Explicit.length,
            Parent : this.Explicit.length > 0
                ? this.Explicit[this.Explicit.length - 1].Scope
                : this.DynamicScope,
        });

        this.ExplicitScope.Parent = parameter.Scope;

        this.Explicit.push(parameter);

        return parameter;
    }

    public toString() : string {
        return `(${this.Explicit.join(`, `)})`;
    }
}
