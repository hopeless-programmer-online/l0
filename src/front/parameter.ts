import Parameters from "./parameters";
import Name from "../tokening/name-token";
import Scope from "./scope";
import Reference from "./reference";

type Parent = Parameters | Parameter;

export default abstract class Parameter {
    readonly Parent : Parent;
    readonly Scope : Scope;
    readonly Name : Name;

    public constructor({ Name, Parent } : { Name : Name, Parent : Parent }) {
        this.Parent = Parent;
        this.Scope = new Scope({
            Parent    : Parent.Scope,
            Reference : new Reference({ Name, Target : this }),
        });
        this.Name = Name;
    }

    public toString() : string {
        return `${this.Name}`;
    }
}
