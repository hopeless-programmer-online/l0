type Index = number;

export default class Input {
    readonly Index : Index;

    public constructor({ Index } : { Index : Index }) {
        this.Index = Index;
    }
}
