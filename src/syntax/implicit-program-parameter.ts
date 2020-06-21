import Parameter from "./program-parameter";

export default class ImplicitProgramParameter extends Parameter {
    public toString() : string {
        return `${this.Variable}`;
    }
}
