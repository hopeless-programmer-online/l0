import Declaration from "./declaration";
import Parameter from "./parameter";
import Name from "./name";
import Output from "./output";

type Target = Declaration | Parameter | Output;

export default class Reference {
    readonly Name : Name;
    readonly Target : Target;

    public constructor({ Name, Target } : { Name : Name, Target : Target }) {
        this.Name = Name;
        this.Target = Target;
    }

    public toString() : string {
        return `${this.Name}`;
    }
}
