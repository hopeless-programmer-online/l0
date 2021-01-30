import Scope from "./scope";

export default abstract class Command {
    public abstract get entry() : Scope
    public abstract get leave() : Scope
}
