export default class Outputs {
    public static From(...names : Array<string>) {
        const array = names.map(text => new Output({ name : new Name({ text }) }))

        return new Outputs({ array })
    }

    private readonly array : Array<Output>
    public  readonly entry = new Scope
    public  readonly leave = new Scope({ parent : this.entry })

    public constructor({ array = [] } : { array? : Array<Output> } = {}) {
        this.array = array

        array.forEach((parameter, index) => {
            parameter.leave.parent = index > 0
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
        return this.array.join(', ')
    }
}

import Name from './name'
import Output from './output'
import Scope from './scope'
