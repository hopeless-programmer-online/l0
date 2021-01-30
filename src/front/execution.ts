import Command from './command'

export type Target = Reference

export default class Execution extends Command {
    public readonly entry = new Scope
    public readonly leave : Scope
    public target : Target
    public inputs : Inputs
    public outputs : Outputs

    public constructor({ target, inputs = new Inputs, outputs = new Outputs } : { target : Target, inputs? : Inputs, outputs? : Outputs }) {
        super()

        this.target = target
        this.inputs = inputs
        this.outputs = outputs

        this.leave = new Scope({ parent : outputs.leave })
    }

    public toString() {
        const { outputs, target, inputs } = this

        return `${outputs}${outputs.empty ? '' : ' : '}${target}(${inputs})`
    }
}

import Reference from './reference'
import Scope from './scope'
import Inputs from './inputs'
import Outputs from './outputs'
