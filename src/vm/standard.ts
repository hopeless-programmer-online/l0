import * as syntax from '../syntax'
import * as semantics from '../semantics'
import { neverThrow } from '../utilities'
import * as vm from '../vm'

const mutability : unique symbol = Symbol(`l0.vm.standard.mutability`)

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

export class Constant extends Something {
    public static readonly mutability : unique symbol = Symbol(`l0.vm.standard.Constant.mutability`)

    public [mutability] : typeof Constant.mutability = Constant.mutability
}

export class Nothing extends Constant {
    public toString() : string {
        return colorize(`nothing`, Colors.fgMagenta)
    }
}

export class Terminal extends Constant {
    public call(buffer : Buffer) : typeof vm.terminal {
        return vm.terminal
    }

    public toString() : string {
        return `${colorize(`<`, Colors.fgWhite)}${colorize(`terminal`, Colors.fgMagenta)}${colorize(`>`, Colors.fgWhite)} ${colorize(`program`, Colors.fgBlue)}`
    }
}

export class Template extends Constant {
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

        if (comment !== undefined) comment = ` ${colorize(`${comment}`, Colors.fgWhite)}`

        return `${colorize(`<`, Colors.fgWhite)}${colorize(`template`, Colors.fgGreen)}${colorize(`>`, Colors.fgWhite)}${comment || ``}`
    }
}

export class Internal extends Constant {
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
        const { first } = buffer

        if (first != this) throw new Error // @tod

        const restored : Buffer = new vm.Buffer({
            nothing : buffer.nothing,
            list : [
                first,
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

export class External extends Constant {
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

class Primitive<Value> extends Constant {
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

export class List extends Constant {
    public readonly elements : Anything[]

    public constructor({ elements = [] } : { elements? : Anything[] } = {}) {
        super()

        this.elements = elements
    }
}

export class Variable extends Something {
    public static readonly mutability : unique symbol = Symbol(`l0.vm.standard.Variable.mutability`)

    public [mutability] : typeof Variable.mutability = Variable.mutability
    public value : Constant

    public constructor({ value } : { value : Constant }) {
        super()

        this.value = value
    }

    public toString() {
        return this.value.toString()
    }
}

export class Console {
    public log(...text : string[]) {
        console.log(...text)
    }
}

export class Context {
    public readonly terminal       : Terminal
    public readonly bind           : External
    public readonly print          : External

    public readonly nothing        : Nothing

    public readonly type           : External

    public readonly var            : External
    public readonly equal          : External

    public readonly Internal       : External
    public readonly getClosure     : External
    public readonly getTemplate    : External
    public readonly Template       : External
    public readonly getTargets     : External
    public readonly getComment     : External

    public readonly External       : External

    public readonly Boolean        : External
    public readonly true           : Boolean
    public readonly false          : Boolean
    public readonly isEqual        : External
    public readonly isNotEqual     : External
    public readonly not            : External
    public readonly and            : External
    public readonly or             : External
    public readonly if             : External

    public readonly Int32          : External
    public readonly add            : External
    public readonly sub            : External
    public readonly mul            : External
    public readonly div            : External
    public readonly less           : External
    public readonly lessOrEqual    : External
    public readonly greater        : External
    public readonly greaterOrEqual : External

    public readonly UTF8String     : External

    public readonly List           : External
    public readonly length         : External
    public readonly get            : External
    public readonly set            : External
    public readonly pushBack       : External
    public readonly pushFront      : External
    public readonly popBack        : External
    public readonly popFront       : External
    public readonly insert         : External
    public readonly remove         : External

    public constructor({ console = new Console } : { console? : Console } = {}) {
        function pack(list : Anything[]) {
            return new vm.Buffer({ nothing, list })
        }

        const terminal = new Terminal
        const bind = External.from(`bind`, buffer => {
            const continuationTemplate = toConstant(buffer.get(1))
            const targetTemplate = toConstant(buffer.get(2))

            if (!(continuationTemplate instanceof Template)) throw new Error // @todo
            if (!(targetTemplate instanceof Template)) throw new Error // @todo

            const closure = buffer.list.slice(3)
            const continuation = new Internal({ closure, template : continuationTemplate })
            const target = new Internal({ closure, template : targetTemplate })

            closure.push(target)

            return pack([ continuation ])
        })
        const print = External.from(`print`, buffer => {
            const [ _, next ] = buffer

            console.log(buffer.list.slice(2).map(x => {
                if (x instanceof UTF8String) return x.value
                if (x instanceof Variable && x.value instanceof UTF8String) return x.value.value

                return to_format_string(x)
            }).join(``))

            return pack([ next, next ])
        })

        const nothing = new Nothing

        const type = External.from(`type`, ([ _, next, target ]) => {
            const target1 = toConstant(target)

            if (target1 instanceof Nothing) return pack([ next, next, nothing ])
            if (target1 instanceof Internal) return pack([ next, next, Internal_ ])
            if (target1 instanceof External) return pack([ next, next, External_ ])
            if (target1 instanceof Boolean) return pack([ next, next, Boolean_ ])
            if (target1 instanceof Int32) return pack([ next, next, Int32_ ])
            if (target1 instanceof UTF8String) return pack([ next, next, UTF8String_ ])
            if (target1 instanceof List) return pack([ next, next, List_ ])
            if (target1 instanceof Template) return pack([ next, next, Template_ ])

            return pack([ next, next, nothing ])
        })

        const var_ = External.from(`var`, ([ _, next, target ]) => {
            const value = toConstant(target)

            return pack([ next, next, new Variable({ value }) ])
        })
        const equal = External.from(`=`, ([ _, next, variable, value ]) => {
            if (!(variable instanceof Variable)) throw new Error(`Cannot set a constant.`)

            variable.value = toConstant(value)

            return pack([ next, next ])
        })

        const Internal_ = External.from(`Internal`, ([ _, next, template, closure ]) => {
            const template1 = toConstant(template)
            const closure1 = toConstant(closure)

            if (!(template1 instanceof Template)) throw new Error // @todo
            if (!(closure1 instanceof List)) throw new Error // @todo

            const internal = new Internal({
                template : template1,
                closure : closure1.elements,
            })

            return pack([ next, next, internal ])
        })
        const getClosure = External.from(`get_closure`, ([ _, next, target ]) => {
            const target1 = toConstant(target)

            if (!(target1 instanceof Internal)) throw new Error // @todo

            return pack([ next, next, new List({ elements : target1.closure.slice() }) ])
        })
        const getTemplate = External.from(`get_template`, ([ _, next, target ]) => {
            const target1 = toConstant(target)

            if (!(target1 instanceof Internal)) throw new Error // @todo

            return pack([ next, next, target1.template ])
        })
        const Template_ = External.from(`Template`, ([ _, next, targets, comment ]) => {
            if (!(targets instanceof List)) throw new Error // @todo

            const { elements } = targets

            const templateTargets = elements.map(x => {
                if (!(x instanceof Int32)) throw new Error // @todo

                return x.value
            })

            const comment1 = toConstant(comment)

            const template = new Template({
                targets : templateTargets,
                comment : comment1 instanceof UTF8String ? comment1.value : undefined,
            })

            return pack([ next, next, template ])
        })
        const getTargets = External.from(`get_targets`, ([ _, next, target ]) => {
            const target1 = toConstant(target)

            if (!(target1 instanceof Template)) throw new Error // @todo

            return pack([ next, next, new List({ elements : target1.targets.map(value => new Int32({ value })) }) ])
        })
        const getComment = External.from(`get_comment`, (buffer) => {
            const [ _, next, target ] = buffer

            const target1 = toConstant(target)

            if (!(target1 instanceof Template)) throw new Error // @todo

            const { comment } = target1

            return pack([ next, next, comment ? new UTF8String({ value : comment }) : buffer.nothing ])
        })

        const External_ = External.from(`External`, ([ _, next, target ]) => {
            const target1 = toConstant(target)

            if (target1 instanceof External) return pack([ next, next, target ])

            return pack([ next, next, nothing ])
        })

        const Boolean_ = External.from(`Boolean`, ([ _, next, target ]) => {
            const target1 = toConstant(target)

            if (target1 instanceof Nothing) return pack([ next, next, false_ ])
            if (target1 instanceof Boolean) return pack([ next, next, target1 ])
            if (target1 instanceof Int32) return pack([ next, next, target1.value > 0 ? true_ : false_ ])
            if (target1 instanceof UTF8String) return pack([ next, next, target1.value.length > 0 ? true_ : false_ ])

            return pack([ next, next, true_ ])
        })
        const true_ = Boolean.from(true)
        const false_ = Boolean.from(false)
        const isEqual = External.from(`==`, ([ _, next, left, right ]) => {
            const left1 = toConstant(left)
            const right1 = toConstant(right)

            if (left1 instanceof Nothing ) return pack([ next, next, right1 instanceof Nothing ? true_ : false_ ])
            if (left1 instanceof Boolean && right1 instanceof Boolean) return pack([ next, next, left1.value === right1.value ? true_ : false_ ])
            if (left1 instanceof Int32 && right1 instanceof Int32) return pack([ next, next, left1.value === right1.value ? true_ : false_ ])
            if (left1 instanceof UTF8String && right1 instanceof UTF8String) return pack([ next, next, left1.value === right1.value ? true_ : false_ ])

            return pack([ next, next, new Boolean({ value : left1 === right1 }) ])
        })
        const isNotEqual = External.from(`!=`, ([ _, next, left, right ]) => {
            const left1 = toConstant(left)
            const right1 = toConstant(right)

            if (left1 instanceof Boolean && right1 instanceof Boolean) return pack([ next, next, left1.value !== right1.value ? true_ : false_ ])
            if (left1 instanceof Int32 && right1 instanceof Int32) return pack([ next, next, left1.value !== right1.value ? true_ : false_ ])
            if (left1 instanceof UTF8String && right1 instanceof UTF8String) return pack([ next, next, left1.value !== right1.value ? true_ : false_ ])

            return pack([ next, next, new Boolean({ value : left1 !== right1 }) ])
        })
        const not = External.from(`not`, ([ _, next, target ]) => {
            const target1 = toConstant(target)

            if (!(target1 instanceof Boolean)) throw new Error // @todo

            return pack([ next, next, new Boolean({ value : !target1.value }) ])
        })
        const and = External.from(`and`, ([ _, next, left, right ]) => {
            const left1 = toConstant(left)
            const right1 = toConstant(right)

            if (!(left1 instanceof Boolean)) throw new Error // @todo
            if (!(right1 instanceof Boolean)) throw new Error // @todo

            return pack([ next, next, new Boolean({ value : left1.value && right1.value }) ])
        })
        const or = External.from(`or`, ([ _, next, left, right ]) => {
            const left1 = toConstant(left)
            const right1 = toConstant(right)

            if (!(left1 instanceof Boolean)) throw new Error // @todo
            if (!(right1 instanceof Boolean)) throw new Error // @todo

            return pack([ next, next, new Boolean({ value : left1.value || right1.value }) ])
        })
        const if_ = External.from(`if`, ([ _, next, condition, then ]) => {
            const condition1 = toConstant(condition)

            if (!(condition1 instanceof Boolean)) throw new Error // @todo

            return condition1.value
                ? pack([ then, next ])
                : pack([ next, next ])
        })

        const Int32_ = External.from(`Int32`, ([ _, next, target ]) => {
            const target1 = toConstant(target)

            if (target1 instanceof Nothing) return pack([ next, next, new Int32({ value : 0 }) ])
            if (target1 instanceof Boolean) return pack([ next, next, new Int32({ value : target1.value ? 1 : 0 }) ])
            if (target1 instanceof Int32) return pack([ next, next, target1 ])
            if (target1 instanceof UTF8String) return pack([ next, next, new Int32({ value : target1.value.length }) ])

            return pack([ next, next, true_ ])
        })
        const add = External.from(`+`, ([ _, next, left, right ]) => {
            const left1 = toConstant(left)
            const right1 = toConstant(right)

            if (left1 instanceof Boolean && right1 instanceof Boolean) return pack([ next, next, new Boolean({ value : left1.value || right1.value }) ])
            if (left1 instanceof Int32 && right1 instanceof Int32) return pack([ next, next, new Int32({ value : left1.value + right1.value }) ])
            if (left1 instanceof UTF8String && right1 instanceof UTF8String) return pack([ next, next, new UTF8String({ value : left1.value + right1.value }) ])
            if (left1 instanceof List && right1 instanceof List) return pack([ next, next, new List({ elements : [ ...left1.elements, ...right1.elements ] }) ])

            throw new Error(`Cannot perform ${left1} + ${right1}`)
        })
        const sub = External.from(`-`, ([ _, next, left, right ]) => {
            const left1 = toConstant(left)
            const right1 = toConstant(right)

            if (left1 instanceof Int32 && right1 instanceof Int32) return pack([ next, next, new Int32({ value : left1.value - right1.value }) ])

            throw new Error(`Cannot perform ${left1} - ${right1}`)
        })
        const mul = External.from(`*`, ([ _, next, left, right ]) => {
            const left1 = toConstant(left)
            const right1 = toConstant(right)

            if (left1 instanceof Boolean && right1 instanceof Boolean) return pack([ next, next, new Boolean({ value : left1.value && right1.value }) ])
            if (left1 instanceof Int32 && right1 instanceof Int32) return pack([ next, next, new Int32({ value : left1.value * right1.value }) ])

            throw new Error // @todo
        })
        const div = External.from(`/`, ([ _, next, left, right ]) => {
            const left1 = toConstant(left)
            const right1 = toConstant(right)

            if (left1 instanceof Int32 && right1 instanceof Int32) return pack([ next, next,
                new Int32({ value : Math.floor(left1.value / right1.value) }),
                new Int32({ value : left1.value % right1.value }),
            ])

            throw new Error // @todo
        })
        const less = External.from(`<`, ([ _, next, left, right ]) => {
            const left1 = toConstant(left)
            const right1 = toConstant(right)

            if (left1 instanceof Boolean && right1 instanceof Boolean) return pack([ next, next, new Boolean({ value : left1.value < right1.value }) ])
            if (left1 instanceof Int32 && right1 instanceof Int32) return pack([ next, next, new Boolean({ value : left1.value < right1.value }) ])
            if (left1 instanceof UTF8String && right1 instanceof UTF8String) return pack([ next, next, new Boolean({ value : left1.value < right1.value }) ])

            throw new Error(`Cannot perform ${left1} < ${right1}`)
        })
        const lessOrEqual = External.from(`<=`, ([ _, next, left, right ]) => {
            const left1 = toConstant(left)
            const right1 = toConstant(right)

            if (left1 instanceof Boolean && right1 instanceof Boolean) return pack([ next, next, new Boolean({ value : left1.value <= right1.value }) ])
            if (left1 instanceof Int32 && right1 instanceof Int32) return pack([ next, next, new Boolean({ value : left1.value <= right1.value }) ])
            if (left1 instanceof UTF8String && right1 instanceof UTF8String) return pack([ next, next, new Boolean({ value : left1.value <= right1.value }) ])

            throw new Error // @todo
        })
        const greater = External.from(`>`, ([ _, next, left, right ]) => {
            const left1 = toConstant(left)
            const right1 = toConstant(right)

            if (left1 instanceof Boolean && right1 instanceof Boolean) return pack([ next, next, new Boolean({ value : left1.value > right1.value }) ])
            if (left1 instanceof Int32 && right1 instanceof Int32) return pack([ next, next, new Boolean({ value : left1.value > right1.value }) ])
            if (left1 instanceof UTF8String && right1 instanceof UTF8String) return pack([ next, next, new Boolean({ value : left1.value > right1.value }) ])

            throw new Error // @todo
        })
        const greaterOrEqual = External.from(`>=`, ([ _, next, left, right ]) => {
            const left1 = toConstant(left)
            const right1 = toConstant(right)

            if (left1 instanceof Boolean && right1 instanceof Boolean) return pack([ next, next, new Boolean({ value : left1.value >= right1.value }) ])
            if (left1 instanceof Int32 && right1 instanceof Int32) return pack([ next, next, new Boolean({ value : left1.value >= right1.value }) ])
            if (left1 instanceof UTF8String && right1 instanceof UTF8String) return pack([ next, next, new Boolean({ value : left1.value >= right1.value }) ])

            throw new Error // @todo
        })

        const UTF8String_ = External.from(`UTF8String`, ([ _, next, target ]) => {
            const target1 = toConstant(target)

            if (target1 instanceof Nothing) return pack([ next, next, new UTF8String({ value : `nothing` }) ])
            if (target1 instanceof Boolean) return pack([ next, next, new UTF8String({ value : target1.value ? `true` : `false` }) ])
            if (target1 instanceof Int32) return pack([ next, next, new UTF8String({ value : `${target1.value}` }) ])
            if (target1 instanceof UTF8String) return pack([ next, next, target1 ])

            return pack([ next, next, true_ ])
        })

        const List_ = External.from(`List`, ([ _, next ]) => {
            return pack([ next, next, new List ])
        })
        const length = External.from(`length`, ([ _, next, target ]) => {
            target = toConstant(target)

            if (target instanceof List) {
                return pack([ next, next, new Int32({ value : target.elements.length }) ])
            }
            if (target instanceof UTF8String) {
                return pack([ next, next, new Int32({ value : target.value.length }) ])
            }

            throw new Error //@todo
        })
        const get = External.from(`get`, ([ _, next, target, index ]) => {
            target = toConstant(target)
            index = toConstant(index)

            if (!(index instanceof Int32)) throw new Error //@todo
            if (target instanceof List) {
                return pack([ next, next, target.elements[index.value] || nothing ])
            }
            if (target instanceof UTF8String) {
                const value = target.value[index.value]

                return pack([ next, next, value !== undefined ? new UTF8String({ value }) : nothing ])
            }

            throw new Error //@todo
        })
        const set = External.from(`set`, ([ _, next, list, index, value ]) => {
            list = toConstant(list)
            index = toConstant(index)
            value = toConstant(value)

            if (!(list instanceof List)) throw new Error //@todo
            if (!(index instanceof Int32)) throw new Error //@todo

            list.elements[index.value] = value

            return pack([ next, next ])
        })
        const pushBack = External.from(`push_back`, ([ _, next, list, element ]) => {
            list = toConstant(list)
            element = toConstant(element)

            if (!(list instanceof List)) throw new Error //@todo

            list.elements.push(element)

            return pack([ next, next ])
        })
        const pushFront = External.from(`push_front`, ([ _, next, list, element ]) => {
            list = toConstant(list)
            element = toConstant(element)

            if (!(list instanceof List)) throw new Error //@todo

            list.elements.unshift(element)

            return pack([ next, next ])
        })
        const popBack = External.from(`pop_back`, ([ _, next, list ]) => {
            list = toConstant(list)

            if (!(list instanceof List)) throw new Error //@todo

            return pack([ next, next, list.elements.pop() || nothing ])
        })
        const popFront = External.from(`pop_front`, ([ _, next, list ]) => {
            list = toConstant(list)

            if (!(list instanceof List)) throw new Error //@todo

            return pack([ next, next, list.elements.shift() || nothing ])
        })
        const insert = External.from(`insert`, ([ _, next, list, index, value ]) => {
            list = toConstant(list)
            index = toConstant(index)
            value = toConstant(value)

            if (!(list instanceof List)) throw new Error //@todo
            if (!(index instanceof Int32)) throw new Error //@todo

            list.elements.splice(index.value, 0, value)

            return pack([ next, next ])
        })
        const remove = External.from(`remove`, ([ _, next, list, index ]) => {
            list = toConstant(list)
            index = toConstant(index)

            if (!(list instanceof List)) throw new Error //@todo
            if (!(index instanceof Int32)) throw new Error //@todo

            list.elements.splice(index.value, 1)

            return pack([ next, next ])
        })

        this.terminal       = terminal
        this.bind           = bind
        this.print          = print

        this.nothing        = nothing

        this.type           = type

        this.var            = var_
        this.equal          = equal

        this.Internal       = Internal_
        this.getClosure     = getClosure
        this.getTemplate    = getTemplate
        this.Template       = Template_
        this.getTargets     = getTargets
        this.getComment     = getComment

        this.External       = External_

        this.Boolean        = Boolean_
        this.true           = true_
        this.false          = false_
        this.isEqual        = isEqual
        this.isNotEqual     = isNotEqual
        this.not            = not
        this.and            = and
        this.or             = or
        this.if             = if_

        this.Int32          = Int32_
        this.add            = add
        this.sub            = sub
        this.mul            = mul
        this.div            = div
        this.less           = less
        this.lessOrEqual    = lessOrEqual
        this.greater        = greater
        this.greaterOrEqual = greaterOrEqual

        this.UTF8String     = UTF8String_

        this.List           = List_
        this.length         = length
        this.get            = get
        this.set            = set
        this.pushBack       = pushBack
        this.pushFront      = pushFront
        this.popBack        = popBack
        this.popFront       = popFront
        this.insert         = insert
        this.remove         = remove
    }

    public resolve(value : semantics.Value) : Anything {
        if (value.symbol === semantics.Template.symbol) return Template.from(value)
        if (value.symbol === semantics.Bind.symbol) return this.bind
        if (value.symbol === semantics.Terminal.symbol) return this.terminal
        if (value.symbol !== semantics.Named.symbol) neverThrow(value, new Error) // @todo

        const { name } = value
        const text = name.toString()

        switch (text) {
            case `super`        : return this.terminal
            case `bind`         : return this.bind
            case `print`        : return this.print

            case `nothing`      : return this.nothing

            case `type`         : return this.type

            case `var`          : return this.var
            case `=`            : return this.equal

            case `Internal`     : return this.Internal
            case `get_closure`  : return this.getClosure
            case `get_template` : return this.getTemplate
            case `Template`     : return this.Template
            case `get_targets`  : return this.getTargets
            case `get_comment`  : return this.getComment

            case `External`     : return this.External

            case `Boolean`      : return this.Boolean
            case `true`         : return this.true
            case `false`        : return this.false
            case `==`           : return this.isEqual
            case `!=`           : return this.isNotEqual
            case `not`          : return this.not
            case `and`          : return this.and
            case `or`           : return this.or
            case `if`           : return this.if

            case `Int32`        : return this.Int32
            case `+`            : return this.add
            case `-`            : return this.sub
            case `*`            : return this.mul
            case `/`            : return this.div
            case `<`            : return this.less
            case `<=`           : return this.lessOrEqual
            case `>`            : return this.greater
            case `>=`           : return this.greaterOrEqual

            case `UTF8String`   : return this.UTF8String

            case `length`       : return this.length
            case `get`          : return this.get
            case `set`          : return this.set
            case `List`         : return this.List
            case `push_back`    : return this.pushBack
            case `push_front`   : return this.pushFront
            case `pop_back`     : return this.popBack
            case `pop_front`    : return this.popFront
            case `insert`       : return this.insert
            case `remove`       : return this.remove
        }

        if (name.words.length === 1 && name.words[0].symbol === syntax.QuotedWord.symbol) return UTF8String.from(name.words[0])

        const int32 = Int32.from(text)

        if (int32) return int32

        throw new Error(`Cannot fill name ${text}.`)
    }
}

export type Anything = Nothing | Terminal | Template | Internal | External | Boolean | Int32 | UTF8String | Variable
export type Buffer = vm.Buffer<Anything>

function toConstant(anything : Anything) : Constant {
    return (
        anything[mutability] === Constant.mutability ? anything :
        anything[mutability] === Variable.mutability ? anything.value :
        neverThrow(anything, new Error) // @todo
    )
}

export function toFormatString(something : Anything) : string {
    if (something instanceof UTF8String) return something.value
    if (something instanceof Variable && something.value instanceof UTF8String) return something.value.value

    const all = new Set<Constant>()
    const ids = new Map<Constant, string>()

    const indent = (x : string) => x !== `` ? x.replace(/^/, `    `).replace(/\n/g, `\n    `) : ``
    const array = (x : string) => `${colorize(`[`, Colors.fgWhite) + (x.length > 0 ? ` ${x} ` : ``) + colorize(`]`, Colors.fgWhite)}`
    const stringify = (something : Constant) : string => {
        let id = ids.get(something)

        if (!(
            something instanceof Boolean ||
            something instanceof Int32 ||
            something instanceof UTF8String
        )) {
            if (id !== undefined) return id

            if (all.has(something)) {
                const id = colorize(colorize(`<ref ${ids.size + 1}>`, Colors.fgBlack), Colors.bgRed)

                ids.set(something, id)

                // console.log(something, id)

                return id
            }
            else all.add(something)
        }

        let text = ``

        if (something instanceof List) {
            let elements = something.elements.map(x => stringify(toConstant(x))).join(colorize(`,\n`, Colors.fgWhite))

            if (elements.length > 0) elements = `\n${indent(elements)}\n`

            text = colorize(`[`, Colors.fgWhite) + elements + colorize(`]`, Colors.fgWhite)
        }
        else if (something instanceof Internal) {
            let closure = something.closure.map(x => stringify(toConstant(x))).join(colorize(`,\n`, Colors.fgWhite))

            if (closure.length > 0) closure = `\n${indent(closure)}\n`

            const closure_text = colorize(`[`, Colors.fgWhite) + closure + colorize(`]`, Colors.fgWhite)

            text = colorize(`program`, Colors.fgBlue) + ` ` + colorize(`{`, Colors.fgWhite) + `\n` +
                `    ${colorize(`template`, Colors.fgWhite)} : ${stringify(something.template)}\n` +
                `    ${colorize(`closure `, Colors.fgWhite)} : ${closure_text}\n` +
                colorize(`}`, Colors.fgWhite) + `\n`
        }
        else if (something instanceof Template) {
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

    return stringify(toConstant(something))
}

type Stringifyable = boolean | number | string | Stringifyable[] | { [key : string] : Stringifyable } | Anything

export function to_format_string(something : Stringifyable) : string {
    const cache = new Map<Stringifyable, string>()
    const used = new Set<Stringifyable>()

    function stringify(something : Stringifyable) : () => string {
        if (typeof something == `boolean`) return stringify_plain(something)
        if (typeof something == `number`) return stringify_plain(something)
        if (typeof something == `string`) return stringify_plain(something)
        if (something instanceof Something) {
            const constant = toConstant(something)

            if (constant instanceof Nothing) return stringify_plain(constant)
            if (constant instanceof Terminal) return stringify_plain(constant)
            if (constant instanceof Boolean) return stringify_plain(constant)
            if (constant instanceof Int32) return stringify_plain(constant)
            if (constant instanceof UTF8String) return stringify_plain(constant)
        }

        const cached = cache.get(something)

        if (cached) {
            used.add(something)

            return () => cached
        }

        const ref = colorize(`<ref ${cache.size + 1}>`, Colors.bgRed, Colors.fgWhite)

        cache.set(something, ref)

        const get_text = stringify_plain(something)

        return () => {
            let text = get_text()

            if (used.has(something)) text = `${ref} ${text}`

            return text
        }
    }
    function indent(text : string, space = `  `) {
        return text
            .replace(/\n/g, `\n${space}`)
            .replace(/^/, space)
    }
    function wrap_content(text : string, begin : string, end : string) {
        if (text.length > 0) text = `\n${indent(text)}\n`

        return `${begin}${text}${end}`
    }
    function wrap_map(map : { [key : string] : string }) {
        const l = [ ...Object.keys(map) ]
            .reduce((a, x) => Math.max(a, x.length), 0)
        const content = [ ...Object.entries(map) ]
            .map(([ k, v ]) => `${$c(k.padEnd(l, ` `))} ${$w`:`} ${v}`)
            .join(`,\n`)

        return wrap_content(
            content,
            $w`{`,
            $w`}`,
        )
    }
    function stringify_plain(something : Stringifyable) : () => string {
        if (typeof something == `boolean`) return () => $b(`${something}`)
        if (typeof something == `number`) return () => $y(`${something}`)
        if (typeof something == `string`) return () => $r(`${JSON.stringify(something)}`)
        if (Array.isArray(something)) {
            const content = something
                .map(stringify)

            return () => wrap_content(
                content
                    .map(x => x())
                    .join(`,\n`),
                $w`[`,
                $w`]`,
            )
        }
        if (!(something instanceof Something)) {
            const l = [ ...Object.keys(something) ]
                .reduce((a, x) => Math.max(a, x.length), 0)
            const content = [ ...Object.entries(something) ]
                .map(([ k, v ]) => () => `${$c(k.padEnd(l, ` `))} ${$w`:`} ${stringify(v)}`)

            return () => wrap_content(
                content
                    .map(x => x())
                    .join(`,\n`),
                $w`{`,
                $w`}`,
            )
        }

        const constant = toConstant(something)

        if (constant instanceof Nothing) return () => $m`nothing`
        if (constant instanceof Terminal) return () => `${br($m`terminal`)} ${$b`program`}`
        if (constant instanceof Template) {
            const targets = stringify(constant.targets)

            return () => `${br($g`template`)}${constant.comment ? ` ${$w(constant.comment)}` : ``} ` + wrap_map({
                targets : targets(),
            })
        }
        if (constant instanceof Internal) {
            const template = stringify(constant.template)
            const closure  = stringify(constant.closure)

            return () => `${br($g`internal`)} ${$b`program`} ` + wrap_map({
                template : template(),
                closure  : closure(),
            })
        }
        if (constant instanceof External) return () => `${br($g`external`)} ${$b`program`} ${$w(constant.name)}`
        if (constant instanceof Boolean) return stringify(constant.value)
        if (constant instanceof Int32) return stringify(constant.value)
        if (constant instanceof UTF8String) return stringify(constant.value)
        if (constant instanceof List) return stringify(constant.elements)

        return () => $m`something`
    }

    return stringify(something)()
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

function colorize(text : string, ...colors : Colors[]) {
    return `${colors.map(x => `\x1b[${x}m`).join(``)}${text}\x1b[${Colors.reset}m`
}
function $r(text : any) {
    return colorize(String(text), Colors.fgRed)
}
function $g(text : any) {
    return colorize(String(text), Colors.fgGreen)
}
function $b(text : any) {
    return colorize(String(text), Colors.fgBlue)
}
function $c(text : any) {
    return colorize(String(text), Colors.fgCyan)
}
function $m(text : any) {
    return colorize(String(text), Colors.fgMagenta)
}
function $y(text : any) {
    return colorize(String(text), Colors.fgYellow)
}
function $w(text : any) {
    return colorize(String(text), Colors.fgWhite)
}
function br(text : any) {
    return `${$w`<`}${String(text)}${$w`>`}`
}
