import Token from "./token";

export default class NameToken extends Token {
    public static Plain(text : string) {
        return new NameToken({
            Words : [
                new PlainWord({ Text : text }),
            ],
        });
    }

    readonly Words : Words;

    public constructor({ Words } : { Words : Words }) {
        super();

        this.Words = Words;
    }

    public IsEqual(other : NameToken) {
        if (this.Words.length !== other.Words.length) return false;

        for (const i of this.Words.keys()) {
            if (!this.Words[i].IsEqual(other.Words[i])) return false;
        }

        return true;
    }

    public toString() {
        return this.Words.join(` `);
    }
}

import PlainWord from "./plain-word";
import Word from "./word";

type Words = Array<Word>;
