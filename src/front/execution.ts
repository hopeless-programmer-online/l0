import Command from "./command";
import Commands from "./commands";
import Scope from "./scope";
import Reference from "./reference";
import Outputs from "./outputs";
import Inputs from "./inputs";
import Input from "./input";

type Parent = Commands | Command;

export default class Execution extends Command {
    readonly Scope : Scope;
    readonly Target : Reference;
    readonly Outputs : Outputs;
    readonly Inputs = new Inputs({ Execution : this });

    public constructor({ Target, Parent } : { Target : Reference, Parent : Parent }) {
        super({ Parent });

        this.Scope = new Scope({
            Parent : Parent.Scope,
        });
        this.Target = Target;
        this.Outputs = new Outputs({ Execution : this });
    }

    public toString() : string {
        return `${this.Outputs}${this.Target}${this.Inputs}`;
    }
}
