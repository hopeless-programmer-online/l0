import Parameters from "./parameters";
import Parameter from "./parameter";
import Name from "./name";

export default class ImplicitParameter extends Parameter {
    public constructor({ Parameters, Name } : { Parameters : Parameters, Name : Name }) {
        super({ Parameters, Name });
    }
}
