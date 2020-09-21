import Command from "./command";
import Program from "./program";
import Commands from "./commands";
import Name from "../tokening/name";
import Scope from "./scope";
import Reference from "./reference";

type Parent = Commands | Command;

export default class Declaration extends Command {
    readonly Name : Name;
    readonly Scope : Scope;
    readonly Program : Program;

    public constructor({ Name, Parent } : { Name : Name, Parent : Parent }) {
        super({ Parent });

        this.Name = Name;
        this.Scope = new Scope({
            Parent    : Parent.Scope,
            Reference : new Reference({ Name, Target : this }),
        });
        this.Program = new Program({ Parent : this });
    }

    public toString() : string {
        return `${this.Name} ${this.Program}`;
    }
}
