import Program from "./program";
import Parameter from "./parameter";
import Explicit from "./explicit-parameter";
import Name from "./name";
import Scope from "./scope";

export default class Parameters {
    private program : Program;
    private set : Set<Parameter> = new Set;
    readonly Scope = new Scope;

    public constructor({ Program } : { Program : Program }) {
        this.program = Program;
    }

    public get Explicit() : Array<Explicit> {
        return Array.from(this.set)
            .filter(parameter => parameter instanceof Explicit)
            .map(parameter => parameter as Explicit)
            .sort((a, b) => b.Index - a.Index);
    }

    public AddExplicit(string : string) {
        const parameter = new Explicit({
            Parameters : this,
            Name       : new Name({ String : string }),
            Index      : this.Explicit.length,
        });

        this.set.add(parameter);
        this.Scope.AddParameter(parameter);
    }
}
