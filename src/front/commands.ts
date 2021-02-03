import Command from './command'
import Scope from './scope'

export default class Commands {
    public static From(...array : Array<Command>) {
        return new Commands({ array })
    }

    private readonly array : Array<Command>
    public readonly entry = new Scope
    public readonly leave = new Scope({ parent : this.entry })

    public constructor({ array = [] } : { array? : Array<Command> } = {}) {
        this.array = array

        array.forEach((command, index) => {
            command.entry.parent = index > 0
                ? array[index - 1].leave
                : this.entry
        })

        if (array.length > 0) this.leave.parent = array[array.length - 1].leave
    }

    public get empty() {
        return this.array.length <= 0
    }

    public *[Symbol.iterator]() {
        return yield * this.array
    }

    public toString() {
        return this.array.join('\n')
    }
}
