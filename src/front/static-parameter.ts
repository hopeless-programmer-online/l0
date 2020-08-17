import Implicit from "./implicit-parameter";
import Name from "./name";
import Parameters from "./parameters";
import Parameter from "./parameter";
import Scope from "./scope";
import Reference from "./reference";

type Parent = Parameters | Parameter;

export default class StaticParameter extends Implicit {
    readonly Reference : Reference;

    public constructor({ Reference, Parent } : { Reference : Reference, Parent : Parent }) {
        super({ Name : Reference.Name, Parent });

        this.Reference = Reference;
    }
}
