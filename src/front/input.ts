import Reference from "./reference";

type Index = number;

export default class Input {
    readonly Index : Index;
    readonly Reference : Reference;

    public constructor({ Reference, Index } : { Reference : Reference, Index : Index }) {
        if (!Number.isInteger(Index) || Index < 0) {
            throw new Error; // @todo
        }

        this.Index = Index;
        this.Reference = Reference;
    }

    public toString() : string {
        return `${this.Reference}`;
    }
}
