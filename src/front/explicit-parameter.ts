import Parameters from "./parameters";
import Parameter from "./parameter";
import Name from "./name";

type Index = number;

export default class ExplicitParameter extends Parameter {
    readonly Index : Index;

    public constructor({ Parameters, Name, Index } : { Parameters : Parameters, Name : Name, Index : Index }) {
        super({ Parameters, Name });

        this.Index = Index;
    }
}
