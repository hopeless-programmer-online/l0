import Implicit from "./implicit-parameter";
import Reference from "./reference";
import Scope from "./scope";

export default class StaticParameter extends Implicit {
    readonly Target : Reference;

    public constructor({ Target, Parent } : { Target : Reference, Parent : Scope }) {
        super({ Name : Target.Name, Parent });

        this.Target = Target;
    }
}
