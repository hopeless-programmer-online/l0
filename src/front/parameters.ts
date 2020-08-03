import Program from "./program";
import Parameter from "./parameter";
import Explicit from "./explicit-parameter";
import Name from "./name";

export default class Parameters {
    readonly program : Program;
    private set : Set<Parameter> = new Set;

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
    }
}
