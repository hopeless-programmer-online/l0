import Parameters from "./parameters";
import Parameter from "./parameter";
import Name from "../tokening/name";

type Parent = Parameters | Parameter;
type Index = number;

export default class ExplicitParameter extends Parameter {
    readonly Index : Index;

    public constructor({ Name, Index, Parent } : { Name : Name, Index : Index, Parent : Parent }) {
        if (!Number.isInteger(Index) || Index < 0) {
            throw new Error; // @todo
        }

        super({ Name, Parent });

        this.Index = Index;
    }
}
