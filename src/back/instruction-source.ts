import Source from "./source";

type Factory = (buffer : Array<any>) => Source;

export default class InstructionSource extends Source {
    readonly Sources : Array<Factory>;

    public constructor({ Sources } : { Sources : Array<Factory> }) {
        super();

        this.Sources = Sources;
    }
}
