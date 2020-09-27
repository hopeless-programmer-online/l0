import NameToken from "../tokening/name";
import Reference from "./reference";

export default class References {
    private map = new Map<NameToken, Reference>([]); // @todo: fix eslint on no parenthesis

    public get Keys() {
        return this.map.keys();
    }
    public get Values() {
        return this.map.values();
    }

    public Has(name : NameToken) {
        for (const key of this.map.keys()) {
            if (name.IsEqual(key)) return true;
        }

        return false;
    }
    public Add(name : NameToken, reference : Reference) {
        if (this.Has(name)) throw new Error;

        this.map.set(name, reference);
    }
    public Get(name : NameToken) {
        for (const [ key, reference ] of this.map) {
            if (name.IsEqual(key)) return reference;
        }

        throw new Error(`${name} does not exists in ${this.toString()}.`);
    }
    public TryGet(name : NameToken) {
        for (const [ key, reference ] of this.map) {
            if (name.IsEqual(key)) return reference;
        }

        return null;
    }

    public toString() : string {
        return `[${[ ...this.map.keys() ].map(x => x.toString()).join(`,`)}]`;
    }
}
