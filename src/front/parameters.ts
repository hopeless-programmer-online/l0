export default class Parameters {
    public static From(...names : Array<string>) {
        const array = names.reduce<Array<Parameter>>((array, text) => {
            const parameter = new Parameter({ name : new Name({ text }) })

            if (array.length > 0) parameter.scope.parent = array[array.length - 1].scope

            array.push(parameter)

            return array
        }, [])

        return new Parameters({ array })
    }

    private readonly array : Array<Parameter>
    public  readonly entry = new Scope
    public  readonly leave = new Scope({ parent : this.entry })

    public constructor({ array = [] } : { array? : Array<Parameter> } = {}) {
        this.array = array

        if (array.length > 0) {
            array[0].scope.parent = this.entry
            this.leave.parent = array[array.length - 1].scope.parent
        }
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
