import Variable from "./variable";

export default abstract class ExecutionProgramCommandOutput {
    readonly Variable : Variable;

    public constructor({ Variable } : { Variable : Variable }) {
        this.Variable = Variable;
    }

    public abstract toString() : string;
}
