import Token from "./token";

export default class NameToken extends Token {
    readonly Name : Name;

    public constructor({ Name } : { Name : Name }) {
        const words = Name.Words;

        super({
            Begin : words[0].Begin,
            End   : words[words.length - 1].End,
        });

        this.Name = Name;
    }

    public toString() {
        return this.Name.toString();
    }
}

import Name from "./name";
