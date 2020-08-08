import Parameters from "./parameters";
import Commands from "./commands";
import Scope from "./scope";

export default class Program {
    readonly Parameters : Parameters;
    readonly Commands = new Commands({ Program : this });

    public constructor({ Parent } : { Parent : Scope }) {
        this.Parameters = new Parameters({
            Program : this,
            Parent,
        });
    }

    public get Scope() : Scope {
        return this.Parameters.Scope;
    }

    public toString() : string {
        return `${this.Parameters} ${this.Commands}`;
    }
}
