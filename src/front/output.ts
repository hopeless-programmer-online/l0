import Outputs from "./outputs";
import Name from "../tokening/name-token";
import Scope from "./scope";
import Reference from "./reference";

type Parent = Outputs | Output;

export default abstract class Output {
    readonly Parent : Parent;
    readonly Scope : Scope;
    readonly Name : Name;

    public constructor({ Name, Parent } : { Name : Name, Parent : Parent }) {
        this.Parent = Parent;
        this.Scope = new Scope({
            Parent    : Parent.Scope,
            Reference : new Reference({
                Name,
                Target : this,
            }),
        });
        this.Name = Name;
    }

    public toString() : string {
        return `${this.Name}`;
    }
}
