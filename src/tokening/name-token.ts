import Token from "./token";
import Word from "./word";

type Words = Array<Word>;

export default class NameToken extends Token {
    readonly Words : Words;

    public constructor({ Words } : { Words : Words }) {
        super();

        this.Words = Words;
    }
}
