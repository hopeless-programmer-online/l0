import Command from './command'

export default class Declaration extends Command {
    public readonly program : Program
    public readonly entry = new Scope
    public readonly leave : Scope

    public constructor({ name, program } : { name : Name, program : Program }) {
        super()

        this.leave = new Scope({ reference : new Reference({ name, target : this }), parent : this.entry })
        this.program = program
    }

    public get name() {
        const { reference } = this.leave

        if (!reference) throw new Error

        return reference.name
    }

    public toString() {
        return `${this.name} ${this.program}`
    }
}

import Name from './name'
import Program from './program'
import Reference from './reference'
import Scope from './scope'
