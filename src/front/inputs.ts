import Execution from "./execution";
import Input from "./input";

export default class Inputs {
    private execution : Execution;
    private set : Set<Input> = new Set;

    public constructor({ Execution } : { Execution : Execution }) {
        this.execution = Execution;
    }
}
