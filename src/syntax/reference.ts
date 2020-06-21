import Variable from "./variable";

type Name = string;

export default class Reference {
    readonly Variable : Variable;
    readonly Name : Name;

    public constructor({ Variable, Name } : { Variable : Variable, Name : Name }) {
        this.Variable = Variable;
        this.Name = Name;
    }
}
