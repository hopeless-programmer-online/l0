import Reference from './reference'

export type Input = Reference

export default class Inputs {
    private readonly array : Array<Input>

    public constructor({ array = [] } : { array? : Array<Input> } = {}) {
        this.array = array
    }

    public *[Symbol.iterator]() {
        return yield * this.array
    }

    public toString() {
        return this.array.join(', ')
    }
}
