import Declaration from "./declaration";
import Parameters from "./parameters";
import Commands from "./commands";
import Scope from "./scope";
import Command from "./command";

type Parent = Declaration | null;

export default class Program {
    readonly Parent : Parent;
    readonly Parameters : Parameters;
    readonly Commands : Commands;

    public constructor({ Parent = null } : { Parent? : Parent } = { Parent : null }) {
        this.Parent = Parent;
        this.Parameters = new Parameters({ Program : this });
        this.Commands = new Commands({ Program : this });
    }

    public toString() : string {
        return `${this.Parameters} ${this.Commands}`;
    }
}
