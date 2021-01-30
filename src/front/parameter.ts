export default class Parameter {
    public static From(text : string) {
        return new Parameter({ name : new Name({ text }) })
    }

    public readonly leave : Scope

    public constructor({ name } : { name : Name }) {
        this.leave = new Scope({ reference : new Reference({ name, target : this }) })
    }

    public get name() {
        const { reference } = this.leave

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
