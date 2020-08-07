import Parameters from "./parameters";
import Parameter from "./parameter";
import Name from "./name";
import Scope from "./scope";

type Index = number;

export default class ExplicitParameter extends Parameter {
    readonly Index : Index;

    public constructor({ Parameters, Name, Index, Parent } : { Parameters : Parameters, Name : Name, Index : Index, Parent : Scope }) {
        super({ Parameters, Name, Parent });

        this.Index = Index;
    }
}
