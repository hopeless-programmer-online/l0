import Parameters from "./parameters";
import Implicit from "./implicit-parameter";
import Name from "./name";
import Scope from "./scope";
import Reference from "./reference";

export default class StaticParameter extends Implicit {
    readonly Reference : Reference;

    public constructor({ Reference, Parameters, Name, Parent } : { Reference : Reference, Parameters : Parameters, Name : Name, Parent : Scope }) {
        super({ Parameters, Name, Parent });

        this.Reference = Reference;
    }
}
