import Instruction from './instruction'

type Callback = (buffer : any[]) => any[]

export default class ExternalInstruction extends Instruction {
    public readonly callback : Callback

    public constructor({ callback } : { callback : Callback }) {
        super()

        this.callback = callback
    }
}
