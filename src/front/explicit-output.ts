import Output from "./output";
import Outputs from "./outputs";
import Name from "./name";
import Scope from "./scope";

type Index = number;

export default class ExplicitOutput extends Output {
    readonly Index : Index;

    public constructor({ Outputs, Name, Index, Parent } : { Outputs : Outputs, Name : Name, Index : Index, Parent : Scope }) {
        super({ Outputs, Name, Parent });

        this.Index = Index;
    }
}
