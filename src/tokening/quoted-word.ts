import Word from "./word";

export default class QuotedWord extends Word {
    readonly Text : string;

    public constructor({ Text } : { Text : string }) {
        super();

        this.Text = Text;
    }
}
