import Output from "./output";
import Outputs from "./outputs";
import Name from "./name";

type Parent = Outputs | Output;
type Index = number;

export default class ExplicitOutput extends Output {
    readonly Index : Index;

    public constructor({ Name, Index, Parent } : { Name : Name, Index : Index, Parent : Parent }) {
        if (!Number.isInteger(Index) || Index < 0) {
            throw new Error; // @todo
        }

        super({ Name, Parent });

        this.Index = Index;
    }
}
