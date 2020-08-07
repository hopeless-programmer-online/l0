import Parameters from "./parameters";
import Name from "./name";
import Scope from "./scope";
import ParameterReference from "./parameter-reference";

export default abstract class Parameter {
    readonly Parameters : Parameters;
    readonly Name : Name;
    readonly Scope : Scope;

    public constructor({ Parameters, Name, Parent } : { Parameters : Parameters, Name : Name, Parent : Scope }) {
        this.Parameters = Parameters;
        this.Name = Name;
        this.Scope = new Scope({
            Parent,
            Reference : new ParameterReference({
                Parameter : this,
                Name,
            }),
        });
    }
}
