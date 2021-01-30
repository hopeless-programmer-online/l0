import Command from './command'

export default class Commands {
    private readonly array : Array<Command>

    public constructor({ array = [] } : { array? : Array<Command> } = {}) {
        this.array = array
    }

    public get empty() {
        return this.array.length > 0
    }

    public *[Symbol.iterator]() {
        return yield * this.array
    }

    public toString() {
        return this.array.join('\n')
    }
}
