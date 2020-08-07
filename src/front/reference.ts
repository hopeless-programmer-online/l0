import Name from "./name";

export default abstract class Reference {
    readonly Name : Name;

    public constructor({ Name } : { Name : Name }) {
        this.Name = Name;
    }

    public abstract Copy(name : Name) : Reference;
}
