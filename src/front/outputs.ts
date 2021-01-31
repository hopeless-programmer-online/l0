export default class Outputs {
    public static From(...names : Array<string>) {
        const array = [
            new Implicit({ name : Name.From('sub') }),
            ...names.map(text => new Explicit({ name : Name.From(text) })),
        ]

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
    public get explicit() {
        return this.array.filter(output => output instanceof Explicit)
    }

    public *[Symbol.iterator]() {
        return yield * this.array
    }

    public toString() {
        return this.explicit.join(', ')
    }
}

import Explicit from './explicit-output'
import Implicit from './implicit-output'
import Name from './name'
import Output from './output'
import Scope from './scope'
