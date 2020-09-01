import Source from "./source";

export default class DynamicSource extends Source {
    readonly Index : number;

    public constructor({ Index } : { Index : number }) {
        super();

        this.Index = Index;
    }
}
