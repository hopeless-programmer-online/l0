import { Instruction, InternalInstruction, ExternalInstruction, TerminalInstruction, BindInstruction, Template } from '../back'
import { ExplicitParameter as Parameter } from '../front'

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
            case 'nothing' : return undefined
            case 'true' : return true
            case 'false' : return false
            case 'bind' : return this.bind
            case 'print' : return new ExternalInstruction({ callback : ([ _, next, ...values ]) => {
                console.log(...values)

                return [ next, next ]
            } })
            case 'is instruction' : return new ExternalInstruction({ callback : ([ _, next, target ]) => {
                const result = target instanceof Instruction

                return [ next, next, result ]
            } })
            case 'is internal instruction' : return new ExternalInstruction({ callback : ([ _, next, target ]) => {
                const result = target instanceof InternalInstruction

                return [ next, next, result ]
            } })
            case 'is external instruction' : return new ExternalInstruction({ callback : ([ _, next, target ]) => {
                const result = target instanceof ExternalInstruction

                return [ next, next, result ]
            } })
            case 'is terminal instruction' : return new ExternalInstruction({ callback : ([ _, next, target ]) => {
                const result = target instanceof TerminalInstruction

                return [ next, next, result ]
            } })
            case 'get template' : return new ExternalInstruction({ callback : ([ _, next, instruction ]) => {
                if (!(instruction instanceof InternalInstruction)) throw new Error

                return [ next, next, instruction.template ]
            } })
            case 'is template' : return new ExternalInstruction({ callback : ([ _, next, target ]) => {
                const result = target instanceof Template

                return [ next, next, result ]
            } })
            case 'get buffer' : return new ExternalInstruction({ callback : ([ _, next, instruction ]) => {
                if (!(instruction instanceof InternalInstruction)) throw new Error

                return [ next, next, instruction.buffer.slice() ]
            } })
            case 'get targets' : return new ExternalInstruction({ callback : ([ _, next, template ]) => {
                if (!(template instanceof Template)) throw new Error

                return [ next, next, template.targets ]
            } })
            case 'if' : return new ExternalInstruction({ callback : ([ _, next, condition, then ]) => {
                if (condition) return [ then, next ]

                return [ next, next ]
            } })
            case 'equal' : return new ExternalInstruction({ callback : ([ _, next, a, b ]) => {
                return [ next, next, a === b ]
            } })
            case 'at' : return new ExternalInstruction({ callback : ([ _, next, a, i ]) => {
                return [ next, next, a[i] ]
            } })
            case 'is_array' : return new ExternalInstruction({ callback : ([ _, next, a ]) => {
                return [ next, next, Array.isArray(a) ]
            } })
            case 'array' : return new ExternalInstruction({ callback : ([ _, next, ...content ]) => {
                return [ next, next, content ]
            } })
            case 'length' : return new ExternalInstruction({ callback : ([ _, next, a ]) => {
                return [ next, next, a.length ]
            } })
            case 'concat' : return new ExternalInstruction({ callback : ([ _, next, a, b ]) => {
                return [ next, next, [ ...a, ...b ] ]
            } })
            case 'slice' : return new ExternalInstruction({ callback : ([ _, next, a, b, e ]) => {
                return [ next, next, a.slice(b, e) ]
            } })
            case 'push_back' : return new ExternalInstruction({ callback : ([ _, next, a, x ]) => {
                a.push(x)

                return [ next, next ]
            } })
            case 'push_front' : return new ExternalInstruction({ callback : ([ _, next, a, x ]) => {
                a.unshift(x)

                return [ next, next ]
            } })
            case 'minus' : return new ExternalInstruction({ callback : ([ _, next, a, b ]) => {
                return [ next, next, a - b ]
            } })
            case 'plus' : return new ExternalInstruction({ callback : ([ _, next, a, b ]) => {
                return [ next, next, a + b ]
            } })
            case 'multiply' : return new ExternalInstruction({ callback : ([ _, next, a, b ]) => {
                return [ next, next, a * b ]
            } })
            case 'not' : return new ExternalInstruction({ callback : ([ _, next, a ]) => {
                return [ next, next, !a ]
            } })
            case 'less' : return new ExternalInstruction({ callback : ([ _, next, a, b ]) => {
                return [ next, next, a < b ]
            } })

            default : throw new Error(`Can't fill parameter ${text}`)
        }
    }
}

/*
typeof()

Object()
Array()

get(target, key)
set(target, key, value)

!
&&
||

==
===
>
>=
<
<=

+
-
*
/
%
**
//

Array.length(target)
Array.push(target, ...values)
Array.pop(target)
Array.unshift(target, ...values)
Array.shift(target)
Array.slice(target, begin, end)
Array.splice(target, begin, end)

Object.entries(target)
Object.keys(target)
Object.values(target)
*/
