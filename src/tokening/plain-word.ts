import Word from "./word";

export default class PlainWord extends Word {
    readonly Text : string;

    public constructor({ Text } : { Text : string }) {
        super();

        this.Text = Text;
    }
}
