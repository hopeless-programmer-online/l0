import Dynamic from "./dynamic-parameter";
import Name from "./name";
import Parameters from "./parameters";
import Parameter from "./parameter";
import Scope from "./scope";
import Reference from "./reference";

type Parent = Parameters | Parameter;

export default class SuperParameter extends Dynamic {
    public constructor({ Parent } : { Parent : Parent }) {
        super({ Name : new Name({ String : `super` }), Parent });
    }
}
