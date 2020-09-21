import Parameter from "./parameter";
import Name from "../tokening/name";
import Output from "./output";
import Declaration from "./declaration";

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
