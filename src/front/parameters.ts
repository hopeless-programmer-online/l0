import Program from "./program";
import Parameter from "./parameter";
import Static from "./static-parameter";
import Dynamic from "./dynamic-parameter";
import Explicit from "./explicit-parameter";
import Name from "./name";
import Scope from "./scope";

/**
 * IMPORTANT: do not add parameters after referencing existed once's.
 */
export default class Parameters {
    private program : Program;
    private array : Array<Parameter> = [];
    readonly Parent : Scope;
    private scope : Scope;

    public constructor({ Program, Parent } : { Program : Program, Parent : Scope }) {
        this.program = Program;
        this.Parent = Parent;
        this.scope = Parent;
    }

    public get Scope() : Scope {
        return this.scope;
    }
    public get Explicit() : Array<Explicit> {
        return this.array
            .filter(parameter => parameter instanceof Explicit)
            .map(parameter => parameter as Explicit)
            .sort((a, b) => b.Index - a.Index);
    }

    public AddStatic(string : string) : Static {
        const scope = this.Scope;
        const reference = scope.GetName(string);
        const parameter = new Static({
            Parent     : scope,
            Parameters : this,
            Name       : new Name({ String : string }),
            Reference  : reference,
        });

        this.array.push(parameter);
        this.scope = parameter.Scope;

        return parameter;
    }
    public AddDynamic(string : string) : Dynamic {
        const parameter = new Dynamic({
            Parent     : this.Scope,
            Parameters : this,
            Name       : new Name({ String : string }),
        });

        this.array.push(parameter);
        this.scope = parameter.Scope;

        return parameter;
    }
    public AddExplicit(string : string) : Explicit {
        const parameter = new Explicit({
            Parent     : this.Scope,
            Parameters : this,
            Name       : new Name({ String : string }),
            Index      : this.Explicit.length,
        });

        this.array.push(parameter);
        this.scope = parameter.Scope;

        return parameter;
    }

    public toString() : string {
        return `(${this.Explicit.join(`, `)})`;
    }
}
