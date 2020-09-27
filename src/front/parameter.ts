import Name from "../tokening/name";
import Scope from "./scope";
import Reference from "./reference";

export default abstract class Parameter {
    readonly Parent : Scope;
    readonly Name : Name;
    readonly Reference : Reference;
    readonly Scope : Scope;

    public constructor({ Name, Parent } : { Name : Name, Parent : Scope }) {
        this.Parent = Parent;
        this.Name = Name;
        this.Reference = new Reference({ Name, Target : this });
        this.Scope = new Scope({ Reference : this.Reference, Parent });
    }

    public toString() : string {
        return `${this.Name}`;
    }
}
