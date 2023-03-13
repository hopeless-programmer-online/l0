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
}

export class Terminal extends Something {
    public call(buffer : Buffer) : typeof vm.terminal {
        return vm.terminal
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
}

export class Int32 extends Primitive<number> {
    public static from(text : string) {
        const match = text.match(/^(?:-|\+)?\s*(?:\d\s*)+$/)

        if (!match) return null

        const value = Number(match[0].replace(/\s/g, ``))

        return new Int32({ value })
    }
}

export class UTF8String extends Primitive<string> {
    public static from(word : syntax.QuotedWord) {
        return new UTF8String({ value : word.text })
    }
}

export default class Context {
    public readonly nothing : Nothing
    public readonly terminal : Terminal
    public readonly true : Boolean
    public readonly false : Boolean
    public readonly bind : External
    public readonly print : External

    public constructor() {
        const nothing = new Nothing
        const terminal = new Terminal
        const true_ = Boolean.from(true)
        const false_ = Boolean.from(false)

        function pack(list : Anything[]) {
            return new vm.Buffer({ nothing, list })
        }

        const bind = External.from(`bind`, buffer => {
            const continuationTemplate = buffer.get(1)
            const targetTemplate = buffer.get(2)

            if (!(continuationTemplate instanceof Template)) throw new Error // @todo
            if (!(targetTemplate instanceof Template)) throw new Error // @todo

            const closure = buffer.list.slice(3)
            const continuation = new Internal({ closure, template : continuationTemplate })
            const target = new Internal({ closure : closure, template : targetTemplate })

            closure.push(target)

            return pack([ continuation ])
        })
        const print = External.from(`print`, ([ _, next, ...params ]) => {
            console.log(...params.map(x => x.toString()))

            return pack([ next, next ])
        })

        this.nothing = nothing
        this.terminal = terminal
        this.true = true_
        this.false = false_
        this.bind = bind
        this.print = print
    }

    public resolve(value : semantics.Value) : Anything {
        if (value.symbol === semantics.Template.symbol) return Template.from(value)
        if (value.symbol === semantics.Bind.symbol) return this.bind
        if (value.symbol === semantics.Terminal.symbol) return this.terminal
        if (value.symbol !== semantics.Named.symbol) neverThrow(value, new Error) // @todo

        const { name } = value
        const text = name.toString()

        switch (text) {
            case `super` : return this.terminal
            case `bind`  : return this.bind
            case `print` : return this.print
            case `true`  : return this.true
            case `false` : return this.false
        }

        if (name.words.length === 1 && name.words[0].symbol === syntax.QuotedWord.symbol) return UTF8String.from(name.words[0])

        const int32 = Int32.from(text)

        if (int32) return int32

        throw new Error // @todo
    }
}

type Anything = Nothing | Terminal | Template | Internal | External
type Buffer = vm.Buffer<Anything>
