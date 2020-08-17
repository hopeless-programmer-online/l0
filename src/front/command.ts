import Commands from "./commands";
import Scope from "./scope";

type Parent = Commands | Command;

export default abstract class Command {
    readonly Parent : Parent;

    public constructor({ Parent } : { Parent : Parent }) {
        this.Parent = Parent;
    }

    public abstract get Scope() : Scope;
}
