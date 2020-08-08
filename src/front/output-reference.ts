import Reference from "./reference";
import Output from "./output";
import Name from "./name";

export default class OutputReference extends Reference {
    readonly Output : Output;

    public constructor({ Output, Name } : { Output : Output, Name : Name }) {
        super({ Name });

        this.Output = Output;
    }

    public Copy(name : Name) : Reference {
        return new OutputReference({
            Name      : name,
            Output : this.Output,
        });
    }
}
