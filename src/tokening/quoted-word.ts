import Word from "./word";
import Position from "./position";

export default class QuotedWord extends Word {
    readonly Text : string;

    public constructor({
        Text,
        Begin,
        End,
    } : {
        Text : string,
        Begin : Position,
        End : Position,
    }) {
        super({ Begin, End });

        this.Text = Text;
    }

    public IsEqual(other : Word) : boolean {
        return other instanceof QuotedWord && this.Text === other.Text;
    }

    public toString() {
        return this.Text;
    }
}
