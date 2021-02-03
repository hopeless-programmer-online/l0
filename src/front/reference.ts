export type Target = Declaration | Parameter | null

export default class Reference {
    public static From(text : string, target : Target) {
        return new Reference({ name : Name.From(text), target })
    }

    public readonly name : Name
    public readonly target : Target

    public constructor({ name, target } : { name : Name, target : Target }) {
        this.name = name
        this.target = target
    }

    public toString() {
        return this.name.toString()
    }
}

import Declaration from './declaration'
import Name from './name'
import Parameter from './parameter'
