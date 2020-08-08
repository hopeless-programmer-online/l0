import Commands from "./commands";
import Command from "./command";
import Inputs from "./inputs";
import Scope from "./scope";
import Reference from "./reference";
import Outputs from "./outputs";

export default class Execution extends Command {
    private target : Reference | null = null;
    readonly Parent : Scope;
    readonly Outputs = new Outputs({ Execution : this });
    readonly Inputs = new Inputs({ Execution : this });

    public constructor({ Commands, Parent } : { Commands : Commands, Parent : Scope }) {
        super({ Commands });

        this.Parent = Parent;
    }

    public get Target() : Reference {
        if (!this.target) {
            throw new Error; // @todo
        }

        return this.target;
    }
    public get Scope() : Scope {
        return this.Outputs.Scope;
    }

    public SetTarget(string : string) {
        if (this.target) {
            throw new Error; // @todo
        }

        this.target = this.Scope.GetName(string);
    }

    public toString() : string {
        const outputs = this.Outputs;
        return `${outputs.IsEmpty ? `` : `${outputs} : `}${this.Target}${this.Inputs}`;
    }
}
