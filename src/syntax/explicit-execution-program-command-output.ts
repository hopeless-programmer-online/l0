import Output from "./execution-program-command-output";
import Variable from "./variable";

type Index = number;

export default class ExecutionProgramCommandOutput extends Output {
    readonly Index : Index;

    public constructor({ Variable, Index } : { Variable : Variable, Index : Index }) {
        super({ Variable });

        this.Index = Index;
    }

    public toString() : string {
        return `${this.Variable}`;
    }
}
