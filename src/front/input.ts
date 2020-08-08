import Inputs from "./inputs";
import Reference from "./reference";

type Index = number;

export default class Input {
    readonly Inputs : Inputs;
    readonly Reference : Reference;
    readonly Index : Index;

    public constructor({ Inputs, Reference, Index } : { Inputs : Inputs, Reference : Reference, Index : Index }) {
        this.Inputs = Inputs;
        this.Reference = Reference;
        this.Index = Index;
    }

    public toString() : string {
        return `${this.Reference}`;
    }
}
