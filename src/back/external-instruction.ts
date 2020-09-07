import Instruction from "./instruction";

type Callback = (inputs : Array<any>) => Array<any>;

export default class ExternalInstruction extends Instruction {
    readonly Callback : Callback;

    public constructor({ Callback } : { Callback : Callback }) {
        super();

        this.Callback = Callback;
    }
}
