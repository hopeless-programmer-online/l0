export type Target = Declaration | Parameter | Output | null

export default class Reference {
    public static from(text : string, target : Target) {
        return new Reference({ name : Name.from(text), target })
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
import Output from './output'
import Parameter from './parameter'
