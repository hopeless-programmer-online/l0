export default class Name {
    public static Plain(text : string) {
        const position = new Position({
            Offset : 0,
            Line   : 0,
            Column : 0,
        });

        return new Name({
            Words : [
                new PlainWord({
                    Text  : text,
                    Begin : position,
                    End   : position,
                }),
            ],
        });
    }

    readonly Words : Words;

    public constructor({ Words } : { Words : Words }) {
        this.Words = Words;
    }

    public IsEqual(other : Name) {
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
import Position from "./position";
import Word from "./word";

type Words = Array<Word>;
