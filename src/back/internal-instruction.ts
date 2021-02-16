import Instruction from './instruction'
import Template from './template'

type Buffer = any[]

export default class InternalInstruction extends Instruction {
    public readonly template : Template
    public readonly buffer : Buffer

    public constructor({ template, buffer } : { template : Template, buffer : Buffer }) {
        super()

        this.template = template
        this.buffer = buffer
    }
}
