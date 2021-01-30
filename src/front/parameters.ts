export default class Parameters {
    public static From(...names : Array<string>) {
        const array = names.map(text => new Parameter({ name : new Name({ text }) }))

        return new Parameters({ array })
    }

    private readonly array : Array<Parameter>
    public  readonly entry = new Scope
    public  readonly leave = new Scope({ parent : this.entry })

    public constructor({ array = [] } : { array? : Array<Parameter> } = {}) {
        this.array = array

        array.forEach((parameter, index) => {
            parameter.leave.parent = index > 0
                ? array[index - 1].leave
                : this.entry
        })

        if (array.length > 0) this.leave.parent = array[array.length - 1].leave
    }

    public *[Symbol.iterator]() {
        return yield * this.array
    }

    public toString() {
        return this.array.join(', ')
    }
}

import Name from './name'
import Parameter from './parameter'
import Scope from './scope'
