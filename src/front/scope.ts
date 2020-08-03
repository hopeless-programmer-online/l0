import Reference from "./reference";
import Parameter from "./parameter";
import ParameterReference from "./parameter-reference";

export default class Scope {
    private parent : Scope | null;
    private list : Array<Reference> = [];

    public constructor({ Parent = null } : { Parent : Scope | null } = { Parent : null }) {
        this.parent = Parent;
    }

    public AddParameter(parameter : Parameter) {
        const reference = new ParameterReference({ Parameter : parameter });

        this.list.push(reference);
    }
}
