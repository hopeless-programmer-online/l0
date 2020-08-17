import Declaration from "./declaration";
import Parameters from "./parameters";
import Commands from "./commands";
import Scope from "./scope";
import Command from "./command";

type Parent = Declaration | null;

export default class Program {
    readonly Parent : Parent;
    readonly Scope = new Scope; // parent scope should always be null
    readonly Parameters : Parameters;
    private commands : Commands | null = null;

    public constructor({ Parent = null } : { Parent? : Parent } = { Parent : null }) {
        this.Parent = Parent;
        this.Parameters = new Parameters({ Program : this });
    }

    public get Commands() : Commands {
        if (!this.commands) {
            this.Parameters.Finalize();

            this.commands = new Commands({ Program : this });
        }

        return this.commands;
    }

    public toString() : string {
        return `${this.Parameters} ${this.Commands}`;
    }
}
