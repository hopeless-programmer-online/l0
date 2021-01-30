export default class Name {
    public static From(text : string) {
        return new Name({ text })
    }

    public readonly text : string

    public constructor({ text } : { text : string }) {
        this.text = text
    }

    public toString() {
        return this.text
    }
}
