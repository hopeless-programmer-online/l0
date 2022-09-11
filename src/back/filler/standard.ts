import { Name } from '../../front'
import { Machine, Filler as TranslationFiller } from '../../translate'

interface Buffer {
    [Symbol.iterator]() : Generator<Something, void>

    get array() : Something[]

    at(index : number) : Something
    slice(begin : number) : Buffer
    push(...values : Something[]) : void
    unshift(...values : Something[]) : void
}
interface Something {
    halt : boolean

    toBoolean1() : boolean
    isEqual1(other : Something) : boolean
    isNotEqual1(other : Something) : boolean
    toNumber1() : number
    toString1() : string

    toBoolean2() : Something
    isEqual2(other : Something) : Something
    isNotEqual2(other : Something) : Something
    not2() : Something
    and2(other : Something) : Something
    or2(other : Something) : Something
    toNumber2() : Something
    add2(other : Something) : Something
    subtract2(other : Something) : Something
    multiply2(other : Something) : Something
    divide2(other : Something) : Something
    wholeDivide2(other : Something) : Something[]
    power2(other : Something) : Something
    root2(other : Something) : Something
    toString2() : Something

    // toNothing(buffer : Buffer) : Buffer
    toBoolean(buffer : Buffer) : Buffer
    toNumber(buffer : Buffer) : Buffer
    isEqual(buffer : Buffer) : Buffer
    isNotEqual(buffer : Buffer) : Buffer
    not(buffer : Buffer) : Buffer
    and(buffer : Buffer) : Buffer
    or(buffer : Buffer) : Buffer
    add(buffer : Buffer) : Buffer
    subtract(buffer : Buffer) : Buffer
    multiply(buffer : Buffer) : Buffer
    divide(buffer : Buffer) : Buffer
    wholeDivide(buffer : Buffer) : Buffer
    power(buffer : Buffer) : Buffer
    root(buffer : Buffer) : Buffer
    call(params : Buffer) : Buffer
}

type Context = {
    // nothing
    // Nothing : Table
    nothing : Something

    // logic
    Boolean : Something
    true : Something
    false : Something
    [`==`] : Something
    [`!=`] : Something
    not : Something
    and : Something
    or : Something

    // arithmetic
    Number : Something
    [`+`] : Something
    [`-`] : Something
    [`*`] : Something
    [`/`] : Something
    [`%`] : Something
    [`**`] : Something
    [`//`] : Something

    // io
    createNumber(value : number) : Something
    createString(value : string) : Something
    print : Something

    // programs
    bind : Something
    createTemplate : (targets : number[]) => Something
    createInstruction : (template : Something, buffer : Something[]) => Something

    // other
    terminal : Something

    createMachine : (buffer : Something[]) => Machine
}

export class Filler extends TranslationFiller<Something, Something, Something> {
    private context = createContext()

    public get bind() {
        return this.context.bind
    }
    public get terminal() {
        return this.context.terminal
    }
    public createTemplate({ targets } : { comment: string; targets: number[] }) : Something {
        return this.context.createTemplate(targets)
    }
    public createInstruction({ template, buffer } : { template: Something; buffer: Something[] }) : Something {
        return this.context.createInstruction(template, buffer)
    }
    public createNamed(name : Name) : Something {
        const { text } = name
        const { context } = this

        const number = text.match(/^(?:\d|\s)+(?:\.(?:\d|\s)+)?$/)

        if (number) {
            const value = Number(text.replace(/\s/g, ``))

            return context.createNumber(value)
        }

        try {
            const string = JSON.parse(text)

            if (typeof string === `string`) return context.createString(string)
        }
        catch(error) {
            // do nothing
        }

        switch (text) {
            // case `Nothing`: return context.Nothing
            case `nothing`: return context.nothing

            case `Boolean`: return context.Boolean
            case `true`: return context.true
            case `false`: return context.false
            case `not`: return context.not
            case `and`: return context.and
            case `or`: return context.or
            case `==`: return context['==']
            case `!=`: return context['!=']

            case `Number`: return context.Number
            case `+`: return context[`+`]
            case `-`: return context[`-`]
            case `*`: return context[`*`]
            case `/`: return context[`/`]
            case `%`: return context[`%`]
            case `**`: return context[`**`]
            case `//`: return context[`//`]

            case `print`: return context.print

            // case `bind`: return context.bind

            // case `super`: return context.super
        }

        throw new Error(`Can't fill name with text "${text}"`)
    }
    public createMachine({ buffer }: { buffer: Something[] }) {
        return this.context.createMachine(buffer)
    }
}

function createContext() : Context {
    class Buffer_ implements Buffer {
        public static from(array : Something[]) {
            return new Buffer_({ array })
        }

        private _array : Something[]

        public constructor({ array } : { array : Something[] }) {
            this._array = array
        }

        public get array() {
            return this._array
        }

        public * [Symbol.iterator]() : Generator<Something> {
            for (const parameter of this._array) yield parameter

            while (true) yield nothing
        }

        public at(index : number) {
            return this._array[index] || nothing
        }
        public slice(begin : number) {
            return Buffer_.from(this._array.slice(begin))
        }
        public push(...values: Something[]) {
            this._array.push(...values)
        }
        public unshift(...values: Something[]) {
            this._array.unshift(...values)
        }
    }
    class Something_ implements Something {
        public halt = false

        public toBoolean1() : boolean {
            throw new Error // @todo
        }
        public isEqual1(other: Something): boolean {
            throw new Error // @todo
        }
        public isNotEqual1(other: Something): boolean {
            return !this.isEqual1(other)
        }
        public toNumber1() : number {
            throw new Error // @todo
        }
        public toString1() : string {
            throw new Error // @todo
        }

        public toBoolean2() : Something {
            return this.toBoolean1() ? true_ : false_
        }
        public not2() : Something {
            throw new Error // @todo
        }
        public and2(other : Something) : Something {
            throw new Error // @todo
        }
        public or2(other : Something) : Something {
            throw new Error // @todo
        }
        public isEqual2(other : Something) : Something {
            const value = this.isEqual1(other)

            return new Boolean_({ value })
        }
        public isNotEqual2(other : Something) : Something {
            const value = this.isNotEqual1(other)

            return new Boolean_({ value })
        }
        public toNumber2() {
            const value = this.toNumber1()

            return new Number_({ value })
        }
        public add2(other : Something) : Something {
            throw new Error // @todo
        }
        public subtract2(other : Something) : Something {
            throw new Error // @todo
        }
        public multiply2(other : Something) : Something {
            throw new Error // @todo
        }
        public divide2(other : Something) : Something {
            throw new Error // @todo
        }
        public wholeDivide2(other : Something) : Something[] {
            throw new Error // @todo
        }
        public power2(other : Something) : Something {
            throw new Error // @todo
        }
        public root2(other : Something) : Something {
            throw new Error // @todo
        }
        public toString2() {
            const value = this.toString1()

            return new String_({ value })
        }

        public toBoolean(buffer : Buffer) : Buffer {
            const [ op, next ] = buffer

            return Buffer_.from([ next, next, this.toBoolean2() ])
        }
        public isEqual(buffer : Buffer_) : Buffer {
            const [ op, next, me, other ] = buffer

            return Buffer_.from([ next, next, this.isEqual2(other) ])
        }
        public isNotEqual(buffer : Buffer_) : Buffer {
            const [ op, next, me, other ] = buffer

            return Buffer_.from([ next, next, this.isNotEqual2(other) ])
        }
        public not(buffer : Buffer_) : Buffer {
            const [ op, next ] = buffer

            return Buffer_.from([ next, next, this.not2() ])
        }
        public and(buffer : Buffer_) : Buffer {
            const [ op, next, me, other ] = buffer

            return Buffer_.from([ next, next, this.and2(other) ])
        }
        public or(buffer : Buffer_) : Buffer {
            const [ op, next, me, other ] = buffer

            return Buffer_.from([ next, next, this.or2(other) ])
        }
        public toNumber(buffer : Buffer) : Buffer {
            const [ op, next ] = buffer

            return Buffer_.from([ next, next, this.toNumber2() ])
        }
        public add(buffer : Buffer) : Buffer {
            const [ op, next, me, other ] = buffer

            return Buffer_.from([ next, next, this.add2(other) ])
        }
        public subtract(buffer : Buffer) : Buffer {
            const [ op, next, me, other ] = buffer

            return Buffer_.from([ next, next, this.subtract2(other) ])
        }
        public multiply(buffer : Buffer) : Buffer {
            const [ op, next, me, other ] = buffer

            return Buffer_.from([ next, next, this.multiply2(other) ])
        }
        public divide(buffer : Buffer) : Buffer {
            const [ op, next, me, other ] = buffer

            return Buffer_.from([ next, next, this.divide2(other) ])
        }
        public wholeDivide(buffer : Buffer) : Buffer {
            const [ op, next, me, other ] = buffer

            return Buffer_.from([ next, next, ...this.wholeDivide2(other) ])
        }
        public power(buffer : Buffer) : Buffer {
            const [ op, next, me, other ] = buffer

            return Buffer_.from([ next, next, this.power2(other) ])
        }
        public root(buffer : Buffer) : Buffer {
            const [ op, next, me, other ] = buffer

            return Buffer_.from([ next, next, this.root2(other) ])
        }
        public call(params : Buffer) : Buffer {
            throw new Error // @todo
        }
    }
    class Nothing_ extends Something_ {
        public toBoolean1() {
            return false
        }
        public isEqual1(other : Something) {
            return other instanceof Nothing_
        }
        public toNumber1() {
            return 0
        }
        public toString1() {
            return colorize(`nothing`, Colors.fgMagenta)
        }
    }
    class Primitive_<Value> extends Something_ {
        public value : Value

        public constructor({ value } : { value : Value }) {
            super()

            this.value = value
        }
    }
    class Boolean_ extends Primitive_<boolean> {
        public toBoolean1() {
            return this.value
        }
        public isEqual1(other : Something) {
            return other instanceof Boolean_ && other.value === this.value
        }
        public toNumber1() {
            return this.value ? 1 : 0
        }
        public toString1() {
            return colorize(`${this.value}`, Colors.fgBlue)
        }

        public not2() {
            const value = !this.value

            return new Boolean_({ value })
        }
        public and2(other: Something) {
            const value = this.value && other.toBoolean1()

            return new Boolean_({ value })
        }
        public or2(other: Something) {
            const value = this.value || other.toBoolean1()

            return new Boolean_({ value })
        }
    }
    class Number_ extends Primitive_<number> {
        public toBoolean1() {
            return this.value !== 0 ? true : false
        }
        public isEqual1(other : Something) {
            return other instanceof Number_ && other.value === this.value
        }
        public toNumber1() {
            return this.value
        }
        public toString1() {
            return colorize(`${this.value}`, Colors.fgYellow)
        }

        public add2(other: Something) {
            const value = this.value + other.toNumber1()

            return new Number_({ value })
        }
        public subtract2(other: Something) {
            const value = this.value - other.toNumber1()

            return new Number_({ value })
        }
        public multiply2(other: Something) {
            const value = this.value * other.toNumber1()

            return new Number_({ value })
        }
        public divide2(other: Something) {
            const value = this.value / other.toNumber1()

            return new Number_({ value })
        }
        public wholeDivide2(other: Something) {
            const a = this.value
            const b = other.toNumber1()
            const c = a % b

            return [ new Number_({ value : (a - c) / b }), new Number_({ value : c }) ]
        }
        public power2(other: Something) {
            const value = this.value ** other.toNumber1()

            return new Number_({ value })
        }
        public root2(other: Something) {
            const value = this.value ** (1 / other.toNumber1())

            return new Number_({ value })
        }
    }
    class String_ extends Primitive_<string> {
        public toBoolean1() {
            return this.value.length > 0 ? true : false
        }
        public isEqual1(other : Something) {
            return other instanceof String_ && other.value === this.value
        }
        public toNumber1() {
            return global.Number(this.value)
        }
        public toString1() {
            return colorize(`${this.value}`, Colors.fgRed)
        }

        public add2(other: Something) {
            const value = this.value + other.toString1()

            return new String_({ value })
        }
    }
    class Terminal_ extends Something_ {
        public halt = true
    }
    class Template_ extends Something_ {
        public readonly targets : number[]

        public constructor({ targets } : { targets : number[] }) {
            super()

            this.targets = targets
        }
    }
    class Internal_ extends Something_ {
        public readonly template : Template_
        public readonly buffer : Buffer

        public constructor({ template, buffer } : { template : Template_, buffer : Buffer }) {
            super()

            this.buffer = buffer
            this.template = template
        }

        public call(params : Buffer) {
            const buffer_ = params.slice(1)

            buffer_.unshift(...this.buffer.array)
            buffer_.unshift(this)

            const next = Buffer_.from(this.template.targets.map(i => buffer_.at(i)))

            return next
        }
    }
    class External_ extends Primitive_<(buffer : Buffer) => Buffer> {
        public call(buffer : Buffer) : Buffer {
            return this.value(buffer)
        }
    }
    class Machine_ implements Machine {
        public buffer : Buffer

        public constructor({ buffer } : { buffer : Buffer }) {
            this.buffer = buffer
        }

        public get instruction() {
            return this.buffer.at(0)
        }
        public get halted() {
            return this.instruction.halt
        }

        public step() {
            const { buffer } = this

            // console.log(buffer)

            const instruction = buffer.at(0)

            // console.log(instruction)

            if (instruction.halt) return

            // if (instruction instanceof Internal_) {
            //     console.log(instruction.template.targets)
            // }

            this.buffer = instruction.call(buffer)
        }
    }

    // const Nothing = new External_({ value : buffer => buffer.at(2).toNothing(buffer) })
    const nothing = new Nothing_

    const Boolean = new External_({ value : buffer => buffer.at(2).toBoolean(buffer) })
    const true_ = new Boolean_({ value : true })
    const false_ = new Boolean_({ value : false })
    const not = new External_({ value : buffer => buffer.at(2).not(buffer) })
    const and = new External_({ value : buffer => buffer.at(2).and(buffer) })
    const or = new External_({ value : buffer => buffer.at(2).or(buffer) })
    // @todo: if
    const isEqual = new External_({ value : buffer => buffer.at(2).isEqual(buffer) })
    const isNotEqual = new External_({ value : buffer => buffer.at(2).isNotEqual(buffer) })

    const Number = new External_({ value : buffer => buffer.at(2).toNumber(buffer) })
    const add = new External_({ value : buffer => buffer.at(2).add(buffer) })
    const subtract = new External_({ value : buffer => buffer.at(2).subtract(buffer) })
    const multiply = new External_({ value : buffer => buffer.at(2).multiply(buffer) })
    const divide = new External_({ value : buffer => buffer.at(2).divide(buffer) })
    const wholeDivide = new External_({ value : buffer => buffer.at(2).wholeDivide(buffer) })
    const power = new External_({ value : buffer => buffer.at(2).power(buffer) })
    const root = new External_({ value : buffer => buffer.at(2).root(buffer) })

    const createNumber = (value : number) => new Number_({ value })
    const createString = (value : string) => new String_({ value })
    const print = new External_({ value : buffer => {
        const [ op, next ] = buffer

        console.log(...buffer.array.slice(2).map(x => x.toString1()))

        return Buffer_.from([ next, next ])
    } })

    const bind = new External_({ value : buffer => {
        const [ op, next, target ] = buffer

        if (!(next instanceof Template_)) throw new Error // @todo
        if (!(target instanceof Template_)) throw new Error // @todo

        const buffer_ = buffer.slice(3)
        const target_ = new Internal_({ template : target, buffer : buffer_ })
        const next_ = new Internal_({ template : next, buffer : buffer_ })

        buffer_.push(target_)

        return next_.call(Buffer_.from([]))
    } })
    const createTemplate = (targets : number[]) => new Template_({ targets })
    const createInstruction = (template : Something, buffer : Something[]) => {
        if (!(template instanceof Template_)) throw new Error // @todo

        const buffer_ = Buffer_.from(buffer)

        return new Internal_({ template, buffer : buffer_ })
    }

    const terminal = new Terminal_

    const createMachine = (buffer : Something[]) => new Machine_({ buffer : Buffer_.from(buffer) })

    return {
        // Nothing,
        nothing,

        Boolean,
        true : true_,
        false : false_,
        [`==`] : isEqual,
        [`!=`] : isNotEqual,
        not,
        and,
        or,

        Number,
        [`+`] : add,
        [`-`] : subtract,
        [`*`] : multiply,
        [`/`] : divide,
        [`%`] : wholeDivide,
        [`**`] : power,
        [`//`] : root,

        createNumber,
        createString,
        print,

        bind,
        createTemplate,
        createInstruction,

        terminal,

        createMachine,
    }
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

/*
Nothing(x)
nothing

Boolean(x)
true
false
not(x)
and(x, y)
or(x, y)
if(x, then)
==(x, y) ; is equal
!=(x, y) ; is not equal

Number(x)
+(x, y)  ; addition
-(x, y)  ; subtraction
*(x, y)  ; multiplication
/(x, y)  ; division
**(x, y) ; power
//(x, y) ; root
%(x, y)  ; integer division

; =(x, y)  ; set
<(x, y)
>(x, y)
<=(x, y)
>=(x, y)

String(x)
length(m)
; todo

Map()
get(m, k)
set(m, k, v)
; todo

Location(x)

print(...text)

bind(next, target, ...buffer)
*/
