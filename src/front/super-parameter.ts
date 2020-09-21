import Dynamic from "./dynamic-parameter";
import Name from "../tokening/name";
import Parameters from "./parameters";
import Parameter from "./parameter";

type Parent = Parameters | Parameter;

export default class SuperParameter extends Dynamic {
    public constructor({ Parent } : { Parent : Parent }) {
        super({ Name : Name.Plain(`super`), Parent });
    }
}
