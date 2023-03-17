import * as syntax from '../syntax'
import * as semantics from '../semantics'
import { neverThrow } from '../utilities'
import * as vm from '../vm'

type State = Buffer | typeof vm.terminal

export abstract class Something extends vm.Anything<Anything> {
    public [vm.call](buffer : Buffer) : State {
        return this.call(buffer)
    }

    public call(buffer : Buffer) : State {
        throw new Error(`Not callable.`)
    }

    public toString() : string {
        return `something`
    }
}

export class Nothing extends Something {
    public toString() : string {
        return colorize(`nothing`, Colors.fgMagenta)
    }
}

export class Terminal extends Something {
    public call(buffer : Buffer) : typeof vm.terminal {
        return vm.terminal
    }

    public toString() : string {
        return `${colorize(`<`, Colors.fgWhite)}${colorize(`terminal`, Colors.fgMagenta)}${colorize(`>`, Colors.fgWhite)} ${colorize(`program`, Colors.fgBlue)}`
    }
}

export class Template extends Something {
    public static from(template : semantics.Template) {
        return new Template({ targets : template.targets.slice(), comment : template.comment })
    }

    public readonly targets : number[]
    public readonly comment? : string

    public constructor({
        targets,
        comment,
    } : {
        targets : number[]
        comment? : string
    }) {
        super()

        this.targets = targets
        this.comment = comment
    }

    public toString() : string {
        let { comment } = this

        if (comment !== undefined) comment = ` ${colorize(`(${comment})`, Colors.fgWhite)}`

        return `${colorize(`<`, Colors.fgWhite)}${colorize(`template`, Colors.fgGreen)}${colorize(`>`, Colors.fgWhite)}${comment}`
    }
}

export class Internal extends Something {
    public readonly template : Template
    public readonly closure : Anything[]

    public constructor({
        template,
        closure,
    } : {
        template : Template
        closure : Anything[]
    }) {
        super()

        this.template = template
        this.closure = closure
    }

    public call(buffer : Buffer) : Buffer {
        const restored : Buffer = new vm.Buffer({
            nothing : buffer.nothing,
            list : [
                buffer.first,
                ...this.closure,
                ...buffer.tail,
            ],
        })

        return new vm.Buffer({
            nothing : buffer.nothing,
            list : this.template.targets.map(i => restored.get(i)),
        })
    }

    public toString() : string {
        let { comment } = this.template

        if (comment !== undefined) comment = ` ${colorize(`(${comment})`, Colors.fgWhite)}`

        return `${colorize(`<`, Colors.fgWhite)}${colorize(`internal`, Colors.fgMagenta)}${colorize(`>`, Colors.fgWhite)} ${colorize(`program`, Colors.fgBlue)}${comment}`
    }
}

export class External extends Something {
    public static from(name : string, callback : (buffer : Buffer) => Buffer) {
        return new External({ name, callback })
    }

    public readonly name : string
    public readonly callback : (buffer : Buffer) => Buffer

    public constructor({
        name,
        callback,
    } : {
        name : string
        callback : (buffer : Buffer) => Buffer
    }) {
        super()

        this.name = name
        this.callback = callback
    }

    public call(buffer : Buffer) : Buffer {
        return this.callback(buffer)
    }

    public toString() : string {
        return `${colorize(`<`, Colors.fgWhite)}${colorize(`external`, Colors.fgMagenta)}${colorize(`>`, Colors.fgWhite)} ${colorize(`program`, Colors.fgBlue)} ${colorize(this.name, Colors.fgGreen)}`
    }
}

class Primitive<Value> extends Something {
    public readonly value : Value

    public constructor({ value } : { value : Value }) {
        super()

        this.value = value
    }
}

export class Boolean extends Primitive<boolean> {
    public static from(value : boolean) {
        return new Boolean({ value })
    }

    public toString() : string {
        return colorize(`${this.value}`, Colors.fgBlue)
    }
}

export class Int32 extends Primitive<number> {
    public static from(text : string) {
        const match = text.match(/^(?:-|\+)?\s*(?:\d\s*)+$/)

        if (!match) return null

        const value = Number(match[0].replace(/\s/g, ``))

        return new Int32({ value })
    }

    public toString() : string {
        return colorize(`${this.value}`, Colors.fgYellow)
    }
}

export class UTF8String extends Primitive<string> {
    public static from(word : syntax.QuotedWord) {
        return new UTF8String({ value : word.unquoted })
    }

    public toString() : string {
        return colorize(`${this.value}`, Colors.fgRed)
    }
}

export default class Context {
    public readonly terminal : Terminal
    public readonly bind : External
    public readonly print : External

    public readonly nothing : Nothing

    public readonly type : Nothing

    public readonly Boolean : External
    public readonly true : Boolean
    public readonly false : Boolean
    public readonly isEqual : External
    public readonly isNotEqual : External
    public readonly not : External
    public readonly and : External
    public readonly or : External

    public readonly Int32 : External
    public readonly add : External
    public readonly sub : External
    public readonly mul : External
    public readonly div : External

    public readonly UTF8String : External

    public constructor() {
        function pack(list : Anything[]) {
            return new vm.Buffer({ nothing, list })
        }

        const terminal = new Terminal
        const bind = External.from(`bind`, buffer => {
            const continuationTemplate = buffer.get(1)
            const targetTemplate = buffer.get(2)

            if (!(continuationTemplate instanceof Template)) throw new Error // @todo
            if (!(targetTemplate instanceof Template)) throw new Error // @todo

            const closure = buffer.list.slice(3)
            const continuation = new Internal({ closure, template : continuationTemplate })
            const target = new Internal({ closure, template : targetTemplate })

            closure.push(target)

            return pack([ continuation ])
        })
        const print = External.from(`print`, ([ _, next, ...params ]) => {
            console.log(...params.map(x => toFormatString(x)))

            return pack([ next, next ])
        })

        const nothing = new Nothing

        const type = External.from(`type`, ([ _, next, a ]) => {
            if (a instanceof Boolean) return pack([ next, next, Boolean_ ])
            if (a instanceof Int32) return pack([ next, next, Int32_ ])
            if (a instanceof UTF8String) return pack([ next, next, UTF8String_ ])

            return pack([ next, next, nothing ])
        })

        const Boolean_ = External.from(`Boolean`, ([ _, next, a ]) => {
            if (a instanceof Nothing) return pack([ next, next, false_ ])
            if (a instanceof Boolean) return pack([ next, next, a ])
            if (a instanceof Int32) return pack([ next, next, a.value > 0 ? true_ : false_ ])
            if (a instanceof UTF8String) return pack([ next, next, a.value.length > 0 ? true_ : false_ ])

            return pack([ next, next, true_ ])
        })
        const true_ = Boolean.from(true)
        const false_ = Boolean.from(false)
        const isEqual = External.from(`==`, ([ _, next, a, b ]) => {
            if (a instanceof Boolean && b instanceof Boolean) return pack([ next, next, a.value === b.value ? true_ : false_ ])
            if (a instanceof Int32 && b instanceof Int32) return pack([ next, next, a.value === b.value ? true_ : false_ ])

            return pack([ next, next, false_ ])
        })
        const isNotEqual = External.from(`!=`, ([ _, next, a, b ]) => {
            if (a instanceof Boolean && b instanceof Boolean) return pack([ next, next, a.value !== b.value ? true_ : false_ ])
            if (a instanceof Int32 && b instanceof Int32) return pack([ next, next, a.value !== b.value ? true_ : false_ ])

            return pack([ next, next, true_ ])
        })
        const not = External.from(`not`, ([ _, next, a ]) => {
            if (!(a instanceof Boolean)) throw new Error // @todo

            return pack([ next, next, new Boolean({ value : !a.value }) ])
        })
        const and = External.from(`and`, ([ _, next, a, b ]) => {
            if (!(a instanceof Boolean)) throw new Error // @todo
            if (!(b instanceof Boolean)) throw new Error // @todo

            return pack([ next, next, new Boolean({ value : a.value && b.value }) ])
        })
        const or = External.from(`or`, ([ _, next, a, b ]) => {
            if (!(a instanceof Boolean)) throw new Error // @todo
            if (!(b instanceof Boolean)) throw new Error // @todo

            return pack([ next, next, new Boolean({ value : a.value || b.value }) ])
        })

        const Int32_ = External.from(`Int32`, ([ _, next, a ]) => {
            if (a instanceof Nothing) return pack([ next, next, new Int32({ value : 0 }) ])
            if (a instanceof Boolean) return pack([ next, next, new Int32({ value : a.value ? 1 : 0 }) ])
            if (a instanceof Int32) return pack([ next, next, a ])
            if (a instanceof UTF8String) return pack([ next, next, new Int32({ value : a.value.length }) ])

            return pack([ next, next, true_ ])
        })
        const add = External.from(`+`, ([ _, next, a, b ]) => {
            if (a instanceof Int32 && b instanceof Int32) return pack([ next, next, new Int32({ value : a.value + b.value }) ])
            if (a instanceof UTF8String && b instanceof UTF8String) return pack([ next, next, new UTF8String({ value : a.value + b.value }) ])

            throw new Error // @todo
        })
        const sub = External.from(`-`, ([ _, next, a, b ]) => {
            if (a instanceof Int32 && b instanceof Int32) return pack([ next, next, new Int32({ value : a.value - b.value }) ])

            throw new Error // @todo
        })
        const mul = External.from(`*`, ([ _, next, a, b ]) => {
            if (a instanceof Int32 && b instanceof Int32) return pack([ next, next, new Int32({ value : a.value * b.value }) ])

            throw new Error // @todo
        })
        const div = External.from(`/`, ([ _, next, a, b ]) => {
            if (a instanceof Int32 && b instanceof Int32) return pack([ next, next, new Int32({ value : a.value / b.value }) ])

            throw new Error // @todo
        })

        const UTF8String_ = External.from(`UTF8String`, ([ _, next, a ]) => {
            if (a instanceof Nothing) return pack([ next, next, new UTF8String({ value : `nothing` }) ])
            if (a instanceof Boolean) return pack([ next, next, new UTF8String({ value : a.value ? `true` : `false` }) ])
            if (a instanceof Int32) return pack([ next, next, new UTF8String({ value : `${a.value}` }) ])
            if (a instanceof UTF8String) return pack([ next, next, a ])

            return pack([ next, next, true_ ])
        })

        this.terminal = terminal
        this.bind = bind
        this.print = print

        this.nothing = nothing

        this.type = type

        this.Boolean = Boolean_
        this.true = true_
        this.false = false_
        this.isEqual = isEqual
        this.isNotEqual = isNotEqual
        this.not = not
        this.and = and
        this.or = or

        this.Int32 = Int32_
        this.add = add
        this.sub = sub
        this.mul = mul
        this.div = div

        this.UTF8String = UTF8String_
    }

    public resolve(value : semantics.Value) : Anything {
        if (value.symbol === semantics.Template.symbol) return Template.from(value)
        if (value.symbol === semantics.Bind.symbol) return this.bind
        if (value.symbol === semantics.Terminal.symbol) return this.terminal
        if (value.symbol !== semantics.Named.symbol) neverThrow(value, new Error) // @todo

        const { name } = value
        const text = name.toString()

        switch (text) {
            case `super`      : return this.terminal
            case `bind`       : return this.bind
            case `print`      : return this.print

            case `nothing`    : return this.nothing

            case `type`       : return this.type

            case `Boolean`    : return this.Boolean
            case `true`       : return this.true
            case `false`      : return this.false
            case `==`         : return this.isEqual
            case `!=`         : return this.isNotEqual
            case `not`        : return this.not
            case `and`        : return this.and
            case `or`         : return this.or

            case `Int32`      : return this.Int32
            case `+`          : return this.add
            case `-`          : return this.sub
            case `*`          : return this.mul
            case `/`          : return this.div

            case `UTF8String` : return this.UTF8String
        }

        if (name.words.length === 1 && name.words[0].symbol === syntax.QuotedWord.symbol) return UTF8String.from(name.words[0])

        const int32 = Int32.from(text)

        if (int32) return int32

        throw new Error(`Cannot fill name ${text}.`)
    }
}

type Anything = Nothing | Terminal | Template | Internal | External
type Buffer = vm.Buffer<Anything>

export function toFormatString(something : Something) : string {
    const all = new Set<Something>()
    const ids = new Map<Something, string>()

    const indent = (x : string) => x !== `` ? x.replace(/^/, `    `).replace(/\n/g, `\n    `) : ``
    const array = (x : string) => `${colorize(`[`, Colors.fgWhite) + (x.length > 0 ? ` ${x} ` : ``) + colorize(`]`, Colors.fgWhite)}`
    const stringify = (something : Something) : string => {
        let id = ids.get(something)

        if (id !== undefined) return id

        if (all.has(something)) {
            const id = colorize(colorize(`<ref ${ids.size + 1}>`, Colors.fgBlack), Colors.bgRed)

            ids.set(something, id)

            return id
        }
        else all.add(something)

        let text = ``;

//         if (something instanceof List_) {
//             let elements = something.elements.map(stringify).join(colorize(`, `, Colors.fgWhite))
//
//             if (elements.length > 0) elements = ` ${elements} `
//
//             text = colorize(`[`, Colors.fgWhite) + elements + colorize(`]`, Colors.fgWhite)
//         }
//         if (something instanceof Internal) {
//             let closure = something.closure.map(x => stringify(x)).join(`\n`)
//
//             closure = closure != ``
//                 ? `{\n${indent(closure)}\n}`
//                 : `{}`
//
//
//             text = `${something.toString()} ${closure}`
//         }
        if (something instanceof Template) {
            let elements = something.targets.map(x => colorize(`${x}`, Colors.fgYellow)).join(colorize(`, `, Colors.fgWhite))

            text = `${something.toString()} ${array(`${elements}`)}`
        }
        else if (something instanceof UTF8String) {
            text = colorize(`${JSON.stringify(something.value)}`, Colors.fgRed)
        }
        else text = something.toString()

        // get id again as it might have changed during nested stringify()
        id = ids.get(something)

        id = id !== undefined ? `${id} ` : ``

        return `${id}${text}`
    }

    return stringify(something)
}

enum Colors {
    reset      = 0,
    bright     = 1,
    dim        = 2,
    underscore = 4,
    blink      = 5,
    reverse    = 7,
    hidden     = 8,

    fgBlack    = 30,
    fgRed      = 31,
    fgGreen    = 32,
    fgYellow   = 33,
    fgBlue     = 34,
    fgMagenta  = 35,
    fgCyan     = 36,
    fgWhite    = 37,

    bgBlack    = 40,
    bgRed      = 41,
    bgGreen    = 42,
    bgYellow   = 43,
    bgBlue     = 44,
    bgMagenta  = 45,
    bgCyan     = 46,
    bgWhite    = 47,
}

function colorize(text : string, color : Colors = Colors.reset) {
    return `\x1b[${color}m${text}\x1b[${Colors.reset}m`
}
