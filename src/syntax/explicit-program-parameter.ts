import Parameter from "./program-parameter";
import Variable from "./variable";

type Index = number;

export default class ExplicitProgramParameter extends Parameter {
    readonly Index : Index;

    public constructor({ Variable, Index } : { Variable : Variable, Index : Index }) {
        super({ Variable });

        this.Index = Index;
    }

    public toString() : string {
        return this.Variable.toString();
    }
}
