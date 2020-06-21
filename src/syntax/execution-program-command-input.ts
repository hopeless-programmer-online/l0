import Reference from "./reference";

export default abstract class ExecutionProgramCommandInput {
    readonly Reference : Reference;

    public constructor({ Reference } : { Reference : Reference }) {
        this.Reference = Reference;
    }

    public abstract toString() : string;
}
