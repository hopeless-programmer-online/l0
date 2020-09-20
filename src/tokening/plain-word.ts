import Word from "./word";

export default class PlainWord extends Word {
    readonly Text : string;

    public constructor({ Text } : { Text : string }) {
        super();

        this.Text = Text;
    }

    public IsEqual(other : Word) : boolean {
        return other instanceof PlainWord && this.Text === other.Text;
    }

    public toString() {
        return this.Text;
    }
}
