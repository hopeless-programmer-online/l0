import ExternalInstruction from './external-instruction'
import Instruction from './instruction'
import InternalInstruction from './internal-instruction'
import TerminalInstruction from './terminal-instruction'

type Buffer = any[]

export default class Machine {
    public buffer : Buffer

    public constructor({ buffer } : { buffer : Buffer }) {
        this.buffer = buffer
    }

    public get instruction() {
        const { buffer } = this

        if (buffer.length < 1) throw new Error // @todo

        return buffer[0]
    }

    public step() {
        const { buffer } = this

        if (buffer.length < 1) throw new Error // @todo

        const instruction = buffer[0]

        if (!(instruction instanceof Instruction)) throw new Error // @todo
        if (instruction instanceof TerminalInstruction) return
        else if (instruction instanceof InternalInstruction) {
            const intermediate = [
                instruction,
                ...instruction.buffer,
                ...buffer.slice(1),
            ]

            this.buffer = instruction.template.targets.map(i => intermediate[i])
        }
        else if (instruction instanceof ExternalInstruction) {
            this.buffer = instruction.callback(buffer)
        }
        else throw new Error // todo
    }
}
