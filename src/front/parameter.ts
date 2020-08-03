import Parameters from "./parameters";
import Name from "./name";

export default abstract class Parameter {
    readonly Parameters : Parameters;
    readonly Name : Name;

    public constructor({ Parameters, Name } : { Parameters : Parameters, Name : Name }) {
        this.Parameters = Parameters;
        this.Name = Name;
    }
}
