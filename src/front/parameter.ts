export default class Parameter {
    public readonly scope : Scope

    public constructor({ name } : { name : Name }) {
        this.scope = new Scope({ reference : new Reference({ name, target : this }) })
    }

    public get name() {
        const { reference } = this.scope

        if (!reference) throw new Error

        return reference.name
    }

    public toString() {
        return this.name.toString()
    }
}

import Name from './name'
import Reference from './reference'
import Scope from './scope'
