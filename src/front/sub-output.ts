import Implicit from "./implicit-output";
import Name from "../tokening/name";
import Outputs from "./outputs";
import Output from "./output";

type Parent = Outputs | Output;

export default class SubOutput extends Implicit {
    public constructor({ Parent } : { Parent : Parent }) {
        super({ Name : Name.Plain(`sub`), Parent });
    }
}
