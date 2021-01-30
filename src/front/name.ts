export default class Name {
    public readonly text : string

    public constructor({ text } : { text : string }) {
        this.text = text
    }

    public toString() {
        return this.text
    }
}
