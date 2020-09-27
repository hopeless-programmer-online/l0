import Dynamic from "./dynamic-parameter";
import Name from "../tokening/name";
import Scope from "./scope";

export default class SuperParameter extends Dynamic {
    public constructor({ Parent } : { Parent : Scope }) {
        super({ Name : Name.Plain(`super`), Parent });
    }
}
