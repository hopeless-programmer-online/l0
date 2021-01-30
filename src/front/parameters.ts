import Parameter from "./parameter";

export default class Parameters {
    private readonly array : Array<Parameter>

    public constructor({ array } : { array : Array<Parameter> } = { array : [] }) {
        this.array = array
    }

    public *[Symbol.iterator]() {
        return yield * this.array
    }

    public toString() {
        return this.array.join(', ')
    }
}
