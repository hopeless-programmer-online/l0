import { ExplicitParameter as Parameter } from '../front'
import BindInstruction from './bind-instruction'
import ExternalInstruction from './external-instruction'

export default class Filler {
    private bind : BindInstruction

    public constructor({ bind } : { bind : BindInstruction }) {
        this.bind = bind
    }

    public fill(parameter : Parameter) {
        const { text } = parameter.name

        // numbers
        if (text.match(/^-?\d+(?:\.\d+)?$/)) {
            const number = Number(text)

            if (!isNaN(number)) return number
        }

        // strings
        if (text.match(/^".*"$/)) {
            // @todo: support 'text' and other forms
            return text
        }

        switch (text) {
            case    'nothing' : return undefined
            case    'true'    : return true
            case    'false'   : return false
            case    'bind'    : return this.bind
            case    'print'   : return new ExternalInstruction({ callback : buffer => {
                console.log(...buffer.slice(2))

                return [ buffer[1], buffer[1] ]
            } })
            default         : throw new Error(`Can't fill parameter ${text}`)
        }
    }
}
