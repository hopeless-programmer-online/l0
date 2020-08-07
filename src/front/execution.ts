import Commands from "./commands";
import Command from "./command";
import Inputs from "./inputs";
import Scope from "./scope";

export default class Execution extends Command {
    readonly Parent : Scope;
    readonly Inputs = new Inputs({ Execution : this });

    public constructor({ Commands, Parent } : { Commands : Commands, Parent : Scope }) {
        super({ Commands });

        this.Parent = Parent;
    }
}
