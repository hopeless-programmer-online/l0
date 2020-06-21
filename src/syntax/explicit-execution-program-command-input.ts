import Input from "./execution-program-command-input";
import Reference from "./reference";

type Index = number;

export default class ExecutionProgramCommandInput extends Input {
    readonly Index : Index;

    public constructor({ Reference, Index } : { Reference : Reference, Index : Index }) {
        super({ Reference });

        this.Index = Index;
    }

    public toString() : string {
        return this.Reference.toString();
    }
}
