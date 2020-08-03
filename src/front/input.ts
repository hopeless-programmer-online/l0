import Inputs from "./inputs";

type Index = number;

export default class Input {
    readonly Inputs : Inputs;
    readonly Index : Index;

    public constructor({ Inputs, Index } : { Inputs : Inputs, Index : Index }) {
        this.Inputs = Inputs;
        this.Index = Index;
    }
}
