import Outputs from "./outputs";
import Scope from "./scope";
import Name from "./name";
import OutputReference from "./output-reference";

export default abstract class Output {
    readonly Outputs : Outputs;
    readonly Name : Name;
    readonly Scope : Scope;

    public constructor({ Outputs, Name, Parent } : { Outputs : Outputs, Name : Name, Parent : Scope }) {
        this.Outputs = Outputs;
        this.Name = Name;
        this.Scope = new Scope({
            Parent,
            Reference : new OutputReference({
                Output : this,
                Name,
            }),
        });
    }

    public toString() : string {
        return `${this.Name}`;
    }
}
