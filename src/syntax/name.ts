export default class Name {
    readonly String : string;

    public constructor({ String } : { String : string }) {
        this.String = String;
    }

    public toString() : string {
        return this.String;
    }
}
