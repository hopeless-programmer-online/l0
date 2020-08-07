import Reference from "./reference";
import Parameter from "./parameter";
import Name from "./name";

export default class ParameterReference extends Reference {
    readonly Parameter : Parameter;

    public constructor({ Parameter, Name } : { Parameter : Parameter, Name : Name }) {
        super({ Name });

        this.Parameter = Parameter;
    }

    public Copy(name : Name) : Reference {
        return new ParameterReference({
            Name      : name,
            Parameter : this.Parameter,
        });
    }
}
