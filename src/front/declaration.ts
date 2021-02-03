import Command from './command'

export default class Declaration extends Command {
    private _program : Program | null = null
    public readonly entry = new Scope
    public readonly leave : Scope

    public constructor({ name, program } : { name : Name, program? : Program }) {
        super()

        this.leave = new Scope({ reference : new Reference({ name, target : this }), parent : this.entry })

        if (program) this.program = program
    }

    public get program() {
        const { _program } = this

        if (!_program) throw new Error // @todo

        return _program
    }
    public set program(program : Program) {
        if (this._program) throw new Error // @todo

        this._program = program
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
