import Token from "./token";

export default class NameToken extends Token {
    readonly String : string;

    public constructor({ String } : { String : string }) {
        super();

        this.String = String;
    }
}
