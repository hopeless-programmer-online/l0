import Instruction from "./instruction";
import Source from "./source";

export default class ShuffleInstruction extends Instruction {
    readonly Sources : Array<Source>;

    public constructor({ Sources } : { Sources : Array<Source> }) {
        super();

        this.Sources = Sources;
    }
}
