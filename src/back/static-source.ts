import Source from "./source";

export default class StaticSource extends Source {
    readonly Value : any;

    public constructor({ Value } : { Value : any }) {
        super();

        this.Value = Value;
    }
}
