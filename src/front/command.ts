import Commands from "./commands";
import Scope from "./scope";

export default abstract class Command {
    readonly Commands : Commands;

    public constructor({ Commands } : { Commands : Commands }) {
        this.Commands = Commands;
    }

    public abstract get Scope() : Scope;

    public abstract toString() : string;
}
