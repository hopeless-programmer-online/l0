import { join } from 'path'
import { readFileSync } from 'fs'
import { parse, translate, back } from './src/l0'

const {
    Template,
    Instruction,
    TerminalInstruction,
    InternalInstruction,
    ExternalInstruction,
    Machine,
} = back

const source = readFileSync(join(__dirname, '1.l0'), 'utf8')
const program = parse(source)
const instruction = translate(program)

const print = new ExternalInstruction({ callback : buffer => {
    console.log(...buffer.slice(2))

    return [ buffer[1], buffer[1] ]
} })
const is_instruction = new ExternalInstruction({ callback : buffer => {
    const result = buffer[2] instanceof Instruction

    return [ buffer[1], buffer[1], result ]
} })
const is_internal_instruction = new ExternalInstruction({ callback : buffer => {
    const result = buffer[2] instanceof InternalInstruction

    return [ buffer[1], buffer[1], result ]
} })
const is_external_instruction = new ExternalInstruction({ callback : buffer => {
    const result = buffer[2] instanceof ExternalInstruction

    return [ buffer[1], buffer[1], result ]
} })
const is_terminal_instruction = new ExternalInstruction({ callback : buffer => {
    const result = buffer[2] instanceof TerminalInstruction

    return [ buffer[1], buffer[1], result ]
} })
const get_template = new ExternalInstruction({ callback : buffer => {
    const instruction = buffer[2]

    if (!(instruction instanceof InternalInstruction)) throw new Error

    return [ buffer[1], buffer[1], instruction.template ]
} })
const is_template = new ExternalInstruction({ callback : buffer => {
    const result = buffer[2] instanceof Template

    return [ buffer[1], buffer[1], result ]
} })
const get_buffer = new ExternalInstruction({ callback : buffer => {
    const instruction = buffer[2]

    if (!(instruction instanceof InternalInstruction)) throw new Error

    return [ buffer[1], buffer[1], instruction.buffer ]
} })
const get_targets = new ExternalInstruction({ callback : ([ _, next, template ]) => {
    if (!(template instanceof Template)) throw new Error

    return [ next, next, template.targets ]
} })
const $if = new ExternalInstruction({ callback : ([ _, next, condition, then ]) => {
    if (condition) return [ then, next ]

    return [ next, next ]
} })
const equal = new ExternalInstruction({ callback : ([ _, next, a, b ]) => {
    return [ next, next, a === b ]
} })
const at = new ExternalInstruction({ callback : ([ _, next, a, i ]) => {
    return [ next, next, a[i] ]
} })
const array = new ExternalInstruction({ callback : ([ _, next ]) => {
    return [ next, next, [] ]
} })
const length = new ExternalInstruction({ callback : ([ _, next, a ]) => {
    return [ next, next, a.length ]
} })
const concat = new ExternalInstruction({ callback : ([ _, next, a, b ]) => {
    return [ next, next, [ ...a, ...b ] ]
} })
const slice = new ExternalInstruction({ callback : ([ _, next, a, b, e ]) => {
    return [ next, next, a.slice(b, e) ]
} })
const push_back = new ExternalInstruction({ callback : ([ _, next, a, x ]) => {
    a.push(x)

    return [ next, next ]
} })
const push_front = new ExternalInstruction({ callback : ([ _, next, a, x ]) => {
    a.unshift(x)

    return [ next, next ]
} })
const minus = new ExternalInstruction({ callback : ([ _, next, a, b ]) => {
    return [ next, next, a - b ]
} })
const plus = new ExternalInstruction({ callback : ([ _, next, a, b ]) => {
    return [ next, next, a + b ]
} })
const not = new ExternalInstruction({ callback : ([ _, next, a ]) => {
    return [ next, next, !a ]
} })
const less = new ExternalInstruction({ callback : ([ _, next, a, b ]) => {
    return [ next, next, a < b ]
} })

const machine = new Machine({ buffer : [
    instruction,
    ...program.parameters.explicit.map(({ name : { text } }) => {
        // booleans
        if (text === 'true') return true
        if (text === 'false') return false

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

        if (text === 'nothing') return undefined
        if (text === 'print') return print
        if (text === 'is instruction') return is_instruction
        if (text === 'is internal instruction') return is_internal_instruction
        if (text === 'is external instruction') return is_external_instruction
        if (text === 'is terminal instruction') return is_terminal_instruction
        if (text === 'is template') return is_template
        if (text === 'get template') return get_template
        if (text === 'get buffer') return get_buffer
        if (text === 'get targets') return get_targets
        if (text === 'if') return $if
        if (text === '=') return equal
        if (text === '#') return at
        if (text === 'array') return array
        if (text === 'length') return length
        if (text === 'concat') return concat
        if (text === 'slice') return slice
        if (text === 'push back') return push_back
        if (text === 'push front') return push_front
        if (text === '-') return minus
        if (text === '+') return plus
        if (text === 'not') return not
        if (text === '<') return less

        throw new Error(`Can't fulfill parameter ${text}`)
    })
] })

while (!(machine.instruction instanceof TerminalInstruction)) machine.step()
