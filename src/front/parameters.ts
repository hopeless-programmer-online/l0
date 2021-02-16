export default class Parameters {
    public static from(...names : Array<string>) {
        const array = [
            new Implicit({ name : new Name({ text : 'super' }) }),
            ...names.map(text => new Explicit({ name : new Name({ text }) })),
        ]

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

    public get explicit() {
        return this.array.filter(parameter => parameter instanceof Explicit)
    }
    public get super() {
        const sup = this.array.find(parameter => parameter instanceof Implicit && parameter.name.text === 'super')

        if (!sup) throw new Error // @todo

        return sup
    }

    public *[Symbol.iterator]() {
        return yield * this.array
    }

    public toString() {
        return this.explicit.join(', ')
    }
}

import Explicit from './explicit-parameter'
import Implicit from './implicit-parameter'
import Name from './name'
import Parameter from './parameter'
import Scope from './scope'
