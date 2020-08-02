import Parameter from "./parameter";

type Index = number;

export default class ExplicitParameter extends Parameter {
    readonly Index : Index;

    public constructor({ Index } : { Index : Index }) {
        super();

        this.Index = Index;
    }
}
