import Reference from "./reference";
import Parameter from "./parameter";

export default class ParameterReference extends Reference {
    readonly Parameter : Parameter;

    public constructor({ Parameter } : { Parameter : Parameter }) {
        super();

        this.Parameter = Parameter;
    }
}
