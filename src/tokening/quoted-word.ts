import Word from "./word";

export default class QuotedWord extends Word {
    readonly Text : string;

    public constructor({ Text } : { Text : string }) {
        super();

        this.Text = Text;
    }

    public IsEqual(other : Word) : boolean {
        return other instanceof QuotedWord && this.Text === other.Text;
    }

    public toString() {
        return this.Text;
    }
}
