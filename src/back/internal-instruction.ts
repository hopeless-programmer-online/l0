import Instruction from './instruction'
import Template from './template'

export default class InternalInstruction extends Instruction {
    public readonly template : Template

    public constructor({ template } : { template : Template }) {
        super()

        this.template = template
    }
}
