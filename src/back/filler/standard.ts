import { Name } from '../../front'
import { Machine, Filler as TranslationFiller } from '../../translate'

interface Buffer {
    [Symbol.iterator]() : Generator<Table, void>

    get array() : Table[]

    at(index : number) : Table
    slice(begin : number) : Buffer
    push(...values : Table[]) : void
    unshift(...values : Table[]) : void
}
interface Table {
    halt : boolean

    toBoolean2() : boolean
    not2() : Table
    and2(other : Table) : Table
    or2(other : Table) : Table
    isEqual2(other : Table) : Table
    isNotEqual2(other : Table) : Table
    toNumber2() : number
    add2(other : Table) : Table
    toString2() : string

    // toNothing(buffer : Buffer) : Buffer
    toBoolean(buffer : Buffer) : Buffer
    toNumber(buffer : Buffer) : Buffer
    not(buffer : Buffer) : Buffer
    and(buffer : Buffer) : Buffer
    or(buffer : Buffer) : Buffer
    isEqual(buffer : Buffer) : Buffer
    isNotEqual(buffer : Buffer) : Buffer
    add(buffer : Buffer) : Buffer
    // subtract(buffer : Buffer) : Buffer
    // multiply(buffer : Buffer) : Buffer
    // divide(buffer : Buffer) : Buffer
    // wholeDivide(buffer : Buffer) : Buffer
    // power(buffer : Buffer) : Buffer
    // root(buffer : Buffer) : Buffer
    call(params : Buffer) : Buffer
}

type Context = {
    // nothing
    // Nothing : Table
    nothing : Table

    // logic
    Boolean : Table
    true : Table
    false : Table
    not : Table
    and : Table
    or : Table
    [`==`] : Table
    [`!=`] : Table

    // arithmetic
    Number : Table
    [`+`] : Table
    // [`-`] : Table
    // [`*`] : Table
    // [`/`] : Table
    // [`%`] : Table
    // [`**`] : Table
    // [`//`] : Table

    // io
    createNumber(value : number) : Table
    print : Table

    // programs
    bind : Table
    createTemplate : (targets : number[]) => Table
    createInstruction : (template : Table, buffer : Table[]) => Table

    // other
    terminal : Table

    createMachine : (buffer : Table[]) => Machine
}

export class Filler extends TranslationFiller<Table, Table, Table> {
    private context = createContext()

    public get bind() {
        return this.context.bind
    }
    public get terminal() {
        return this.context.terminal
    }
    public createTemplate({ targets } : { comment: string; targets: number[] }) : Table {
        return this.context.createTemplate(targets)
    }
    public createInstruction({ template, buffer } : { template: Table; buffer: Table[] }) : Table {
        return this.context.createInstruction(template, buffer)
    }
    public createNamed({ text } : Name) : Table {
        const { context } = this

        const number = text.match(/^(?:\d|\s)+(?:\.(?:\d|\s)+)?$/)

        if (number) {
            const value = Number(text.replace(/\s/g, ``))

            return context.createNumber(value)
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
            // case `-`: return context[`-`]
            // case `*`: return context[`*`]
            // case `/`: return context[`/`]
            // case `%`: return context[`%`]
            // case `**`: return context[`**`]
            // case `//`: return context[`//`]

            case `print`: return context.print

            // case `bind`: return context.bind

            // case `super`: return context.super
        }

        throw new Error(`Can't fill name with text "${text}"`)
    }
    public createMachine({ buffer }: { buffer: Table[] }) {
        return this.context.createMachine(buffer)
    }
}

function createContext() : Context {
    class Buffer_ implements Buffer {
        public static from(array : Table[]) {
            return new Buffer_({ array })
        }

        private _array : Table[]

        public constructor({ array } : { array : Table[] }) {
            this._array = array
        }

        public get array() {
            return this._array
        }

        public * [Symbol.iterator]() : Generator<Table> {
            for (const parameter of this._array) yield parameter

            while (true) yield nothing
        }

        public at(index : number) {
            return this._array[index] || nothing
        }
        public slice(begin : number) {
            return Buffer_.from(this._array.slice(begin))
        }
        public push(...values: Table[]) {
            this._array.push(...values)
        }
        public unshift(...values: Table[]) {
            this._array.unshift(...values)
        }
    }
    class Table_ implements Table {
        public halt = false

        public toBoolean2() : boolean {
            return true
        }
        public not2() {
            const value = this.toBoolean2()

            return new Boolean_({ value })
        }
        public and2(other : Table) {
            const left = this.toBoolean2()
            const right = other.toBoolean2()
            const value = left && right

            return new Boolean_({ value })
        }
        public or2(other : Table) {
            const left = this.toBoolean2()
            const right = other.toBoolean2()
            const value = left || right

            return new Boolean_({ value })
        }
        public isEqual2(other : Table) : Table {
            const value = this === other

            return new Boolean_({ value })
        }
        public isNotEqual2(other : Table) : Table {
            const value = this !== other

            return new Boolean_({ value })
        }
        public toNumber2() : number {
            return 1
        }
        public add2(other : Table) {
            const value = this.toNumber2() + other.toNumber2()

            return new Number_({ value })
        }
        public toString2() {
            return colorize(`table`, Colors.fgGreen)
        }

        public toBoolean(buffer : Buffer) : Buffer {
            const [ next ] = buffer

            return Buffer_.from([ next, next, new Boolean_({ value : this.toBoolean2() }) ])
        }

        public not(buffer : Buffer_) : Buffer {
            const [ next ] = buffer

            return Buffer_.from([ next, next, this.not2() ])
        }
        public and(buffer : Buffer_) : Buffer {
            const [ next, other ] = buffer

            return Buffer_.from([ next, next, this.and2(other) ])
        }
        public or(buffer : Buffer_) : Buffer {
            const [ next, other ] = buffer

            return Buffer_.from([ next, next, this.or2(other) ])
        }
        public isEqual(buffer : Buffer_) : Buffer {
            const [ next, other ] = buffer

            return Buffer_.from([ next, next, this.isEqual2(other) ])
        }
        public isNotEqual(buffer : Buffer_) : Buffer {
            const [ next, other ] = buffer

            return Buffer_.from([ next, next, this.isNotEqual2(other) ])
        }
        public toNumber(buffer : Buffer) : Buffer {
            const [ next ] = buffer

            return Buffer_.from([ next, next, new Number_({ value : this.toNumber2() }) ])
        }
        public add(buffer : Buffer) : Buffer {
            const [ next, other ] = buffer

            return Buffer_.from([ next, next, this.add2(other) ])
        }
        // public subtract(buffer : Buffer) : Buffer {
        //     return this.uniformCall(subtract, buffer)
        // }
        // public multiply(buffer : Buffer) : Buffer {
        //     return this.uniformCall(multiply, buffer)
        // }
        // public divide(buffer : Buffer) : Buffer {
        //     return this.uniformCall(divide, buffer)
        // }
        // public wholeDivide(buffer : Buffer) : Buffer {
        //     return this.uniformCall(wholeDivide, buffer)
        // }
        // public power(buffer : Buffer) : Buffer {
        //     return this.uniformCall(power, buffer)
        // }
        // public root(buffer : Buffer) : Buffer {
        //     return this.uniformCall(root, buffer)
        // }
        public call(params : Buffer) : Buffer {
            throw new Error // @todo
        }
    }
    class Nothing_ extends Table_ {
        public toBoolean2() {
            return false
        }
        public toNumber2() {
            return 0
        }
        public not2() {
            const value = !undefined

            return new Boolean_({ value })
        }
        public isEqual2(other : Table) {
            const value = other instanceof Nothing_

            return new Boolean_({ value })
        }
        public toString2() {
            return colorize(`nothing`, Colors.fgMagenta)
        }
    }
    class Primitive_<Value> extends Table_ {
        public value : Value

        public constructor({ value } : { value : Value }) {
            super()

            this.value = value
        }
    }
    class Boolean_ extends Primitive_<boolean> {
        public toBoolean2() {
            return this.value
        }
        public not2() {
            const value = !this.value

            return new Boolean_({ value })
        }
        public and2(other : Table) {
            const value : boolean = other instanceof Boolean_ && other.value && this.value

            return new Boolean_({ value })
        }
        public or2(other : Table) {
            const value : boolean = other instanceof Boolean_ && (other.value || this.value)

            return new Boolean_({ value })
        }
        public isEqual2(other : Table) {
            const value : boolean = other instanceof Boolean_ && other.value === this.value

            return new Boolean_({ value })
        }
        public isNotEqual2(other : Table) {
            const value : boolean = other instanceof Boolean_ && other.value !== this.value

            return new Boolean_({ value })
        }

        public toNumber2() {
            return this.value ? 1 : 0
        }

        public toString2() {
            return colorize(`${this.value}`, Colors.fgBlue)
        }
    }
    class Number_ extends Primitive_<number> {
        public toBoolean2() {
            return this.value !== 0 ? true : false
        }
        public not2() {
            const value = !this.value

            return new Boolean_({ value })
        }
        public isEqual2(other : Table) {
            const value : boolean = other instanceof Number_ && other.value === this.value

            return new Boolean_({ value })
        }
        public isNotEqual2(other : Table) {
            const value : boolean = other instanceof Number_ && other.value !== this.value

            return new Boolean_({ value })
        }

        public toNumber2() {
            return this.value
        }

        public toString2() {
            return colorize(`${this.value}`, Colors.fgYellow)
        }

        // public add([ op, next, other ] : Buffer_) {
        //     const casted = other.toNumber()

        //     if (!(casted instanceof Number_)) throw new Error // @todo

        //     return Buffer_.from([ next, next, new Number_({ value : this.value + casted.value }) ]) // @todo: replace with safe continuation?
        // }
        // public subtract([ op, next, other ] : Buffer_) {
        //     const casted = other.toNumber()

        //     if (!(casted instanceof Number_)) throw new Error // @todo

        //     return Buffer_.from([ next, next, new Number_({ value : this.value - casted.value }) ]) // @todo: replace with safe continuation?
        // }
        // public multiply([ op, next, other ] : Buffer_) {
        //     const casted = other.toNumber()

        //     if (!(casted instanceof Number_)) throw new Error // @todo

        //     return Buffer_.from([ next, next, new Number_({ value : this.value * casted.value }) ]) // @todo: replace with safe continuation?
        // }
        // public divide([ op, next, other ] : Buffer_) {
        //     const casted = other.toNumber()

        //     if (!(casted instanceof Number_)) throw new Error // @todo

        //     return Buffer_.from([ next, next, new Number_({ value : this.value / casted.value }) ]) // @todo: replace with safe continuation?
        // }
        // public wholeDivide([ op, next, other ] : Buffer_) {
        //     const x = this.value
        //     const casted = other.toNumber()

        //     if (!(casted instanceof Number_)) throw new Error // @todo

        //     const y = casted.value
        //     const remainder = x % y
        //     const fraction = (x - remainder) / y

        //     return Buffer_.from([ next, next, new Number_({ value : fraction }), new Number_({ value : remainder }) ]) // @todo: replace with safe continuation?
        // }
        // public power([ op, next, other ] : Buffer_) {
        //     const casted = other.toNumber()

        //     if (!(casted instanceof Number_)) throw new Error // @todo

        //     return Buffer_.from([ next, next, new Number_({ value : this.value ** casted.value }) ]) // @todo: replace with safe continuation?
        // }
        // public root([ op, next, other ] : Buffer_) {
        //     const casted = other.toNumber()

        //     if (!(casted instanceof Number_)) throw new Error // @todo

        //     return Buffer_.from([ next, next, new Number_({ value : this.value ** (1 / casted.value) }) ]) // @todo: replace with safe continuation?
        // }
    }
    class Terminal_ extends Table_ {
        public halt = true
    }
    class Template_ extends Table_ {
        public readonly targets : number[]

        public constructor({ targets } : { targets : number[] }) {
            super()

            this.targets = targets
        }
    }
    class Internal_ extends Table_ {
        public readonly template : Template_
        public readonly buffer : Buffer

        public constructor({ template, buffer } : { template : Template_, buffer : Buffer }) {
            super()

            this.buffer = buffer
            this.template = template
        }

        public call(params : Buffer) {
            const buffer_ = params.slice(0)

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

            const params = buffer.slice(1)

            // if (instruction instanceof Internal_) {
            //     console.log(instruction.template.targets)
            // }

            this.buffer = instruction.call(params)
        }
    }

    // const Nothing = new External_({ value : buffer => buffer.at(2).toNothing(buffer) })
    const nothing = new Nothing_

    const Boolean = new External_({ value : buffer => buffer.at(1).toBoolean(buffer) })
    const true_ = new Boolean_({ value : true })
    const false_ = new Boolean_({ value : false })
    const not = new External_({ value : buffer => buffer.at(1).not(buffer) })
    const and = new External_({ value : buffer => buffer.at(1).and(buffer) })
    const or = new External_({ value : buffer => buffer.at(1).or(buffer) })
    // @todo: if
    const isEqual = new External_({ value : buffer => buffer.at(1).isEqual(buffer) })
    const isNotEqual = new External_({ value : buffer => buffer.at(1).isNotEqual(buffer) })

    const Number = new External_({ value : buffer => buffer.at(1).toNumber(buffer) })
    const add = new External_({ value : buffer => buffer.at(1).add(buffer) })
    // const subtract = new External_({ value : buffer => buffer.at(2).add(buffer) })
    // const multiply = new External_({ value : buffer => buffer.at(2).multiply(buffer) })
    // const divide = new External_({ value : buffer => buffer.at(2).divide(buffer) })
    // const wholeDivide = new External_({ value : buffer => buffer.at(2).wholeDivide(buffer) })
    // const power = new External_({ value : buffer => buffer.at(2).power(buffer) })
    // const root = new External_({ value : buffer => buffer.at(2).root(buffer) })

    const createNumber = (value : number) => new Number_({ value })
    const print = new External_({ value : buffer => {
        const [ next ] = buffer

        console.log(...buffer.array.slice(1).map(x => x.toString2()))

        return Buffer_.from([ next, next ])
    } })

    const bind = new External_({ value : buffer => {
        const [ next, target ] = buffer

        if (!(next instanceof Template_)) throw new Error // @todo
        if (!(target instanceof Template_)) throw new Error // @todo

        const buffer_ = buffer.slice(2)
        const target_ = new Internal_({ template : target, buffer : buffer_ })
        const next_ = new Internal_({ template : next, buffer : buffer_ })

        buffer_.push(target_)

        return next_.call(Buffer_.from([]))
    } })
    const createTemplate = (targets : number[]) => new Template_({ targets })
    const createInstruction = (template : Table, buffer : Table[]) => {
        if (!(template instanceof Template_)) throw new Error // @todo

        const buffer_ = Buffer_.from(buffer)

        return new Internal_({ template, buffer : buffer_ })
    }

    const terminal = new Terminal_

    const createMachine = (buffer : Table[]) => new Machine_({ buffer : Buffer_.from(buffer) })

    return {
        // Nothing,
        nothing,

        Boolean,
        true : true_,
        false : false_,
        not,
        and,
        or,
        [`==`] : isEqual,
        [`!=`] : isNotEqual,

        Number,
        [`+`] : add,
        // [`-`] : subtract,
        // [`*`] : multiply,
        // [`/`] : divide,
        // [`%`] : wholeDivide,
        // [`**`] : power,
        // [`//`] : root,

        createNumber,
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
