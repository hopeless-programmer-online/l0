import Variable from "./variable";
import Name from "./name";

export default class Reference {
    readonly Variable : Variable;
    readonly Name : Name;

    public constructor({ Variable, Name } : { Variable : Variable, Name : Name }) {
        this.Variable = Variable;
        this.Name = Name;
    }

    public toString() : string {
        return this.Name.String;
    }
}
