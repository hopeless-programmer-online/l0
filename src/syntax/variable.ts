import Name from "./name";

export default class Variable {
    readonly Name : Name;

    public constructor({ Name } : { Name : Name }) {
        this.Name = Name;
    }

    public toString() : string {
        return this.Name.String;
    }
}
