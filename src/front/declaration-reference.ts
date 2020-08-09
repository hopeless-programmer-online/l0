import Reference from "./reference";
import Declaration from "./declaration";
import Name from "./name";

export default class DeclarationReference extends Reference {
    readonly Declaration : Declaration;

    public constructor({ Declaration, Name } : { Declaration : Declaration, Name : Name }) {
        super({ Name });

        this.Declaration = Declaration;
    }

    public Copy(name : Name) : Reference {
        return new DeclarationReference({
            Name        : name,
            Declaration : this.Declaration,
        });
    }
}
