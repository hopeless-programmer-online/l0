import Token from "./token";

export default class NameToken extends Token {
    readonly Name : Name;

    public constructor({ Name } : { Name : Name }) {
        super();

        this.Name = Name;
    }

    public toString() {
        return this.Name.toString();
    }
}

import Name from "./name";
