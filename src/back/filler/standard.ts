import { Name } from '../../front'
import { Machine, Filler as TranslationFiller } from '../../translate'

interface Buffer {
    [Symbol.iterator]() : Generator<Table, void>

    at(index : number) : Table
    slice(begin : number) : Buffer
    push(...values : Table[]) : void
    unshift(...values : Table[]) : void
}
interface Table {
    halt : boolean

    // toNothing(buffer : Buffer) : Buffer
    // toBoolean(buffer : Buffer) : Buffer
    // toNumber(buffer : Buffer) : Buffer
    // not(buffer : Buffer) : Buffer
    // and(buffer : Buffer) : Buffer
    // or(buffer : Buffer) : Buffer
    // isEqual(buffer : Buffer) : Buffer
    // isNotEqual(buffer : Buffer) : Buffer
    // add(buffer : Buffer) : Buffer
    // subtract(buffer : Buffer) : Buffer
    // multiply(buffer : Buffer) : Buffer
    // divide(buffer : Buffer) : Buffer
    // wholeDivide(buffer : Buffer) : Buffer
    // power(buffer : Buffer) : Buffer
    // root(buffer : Buffer) : Buffer
    call(buffer : Buffer) : Buffer
}

type Context = {
    // // nothing
    // Nothing : Table
    // nothing : Table

    // // logic
    // Boolean : Table
    // true : Table
    // false : Table
    // not : Table
    // and : Table
    // or : Table
    // [`==`] : Table
    // [`!=`] : Table

    // // arithmetic
    // Number : Table
    // [`+`] : Table
    // [`-`] : Table
    // [`*`] : Table
    // [`/`] : Table
    // [`%`] : Table
    // [`**`] : Table
    // [`//`] : Table

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
    public createNamed(name: Name) : Table {
        const { context } = this

        switch (name.text) {
            // case `Nothing`: return context.Nothing
            // case `Nothing`: return context.Nothing

            // case `Boolean`: return context.Boolean
            // case `true`: return context.true
            // case `false`: return context.false
            // case `not`: return context.not
            // case `and`: return context.and
            // case `or`: return context.or
            // case `==`: return context['==']
            // case `!=`: return context['!=']

            // case `Number`: return context.Number
            // case `+`: return context[`+`]
            // case `-`: return context[`-`]
            // case `*`: return context[`*`]
            // case `/`: return context[`/`]
            // case `%`: return context[`%`]
            // case `**`: return context[`**`]
            // case `//`: return context[`//`]

            // case `bind`: return context.bind

            // case `super`: return context.super
        }

        throw new Error // @todo
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

        private array : Table[]

        public constructor({ array } : { array : Table[] }) {
            this.array = array
        }

        public * [Symbol.iterator]() : Generator<Table> {
            for (const parameter of this.array) yield parameter

            while (true) yield nothing
        }

        public at(index : number) {
            return this.array[index] || nothing
        }
        public slice(begin : number) {
            return Buffer_.from(this.array.slice(begin))
        }
        public push(...values: Table[]) {
            this.array.push(...values)
        }
        public unshift(...values: Table[]) {
            this.array.unshift(...values)
        }
    }
    class Table_ implements Table {
        public halt = false
        // public readonly entries : { key : Table_, value : Table_ }[] = []

        // private uniformCall(target : Table_, buffer : Buffer) {
        //     for (const { key, value } of this.entries) if (key.isEqual(target)) {
        //         return value.call(buffer)
        //     }

        //     throw new Error // @todo
        // }

        // public toNothing(buffer : Buffer) : Buffer {
        //     return this.uniformCall(Nothing, buffer)
        // }
        // public toBoolean(buffer : Buffer) : Buffer {
        //     return this.uniformCall(Boolean, buffer)
        // }
        // public not(buffer : Buffer) : Buffer {
        //     return this.uniformCall(not, buffer)
        // }
        // public and(buffer : Buffer_) : Buffer {
        //     return this.uniformCall(and, buffer)
        // }
        // public or(buffer : Buffer_) : Buffer {
        //     return this.uniformCall(or, buffer)
        // }
        // public isEqual(buffer : Buffer_) : Buffer {
        //     return this.uniformCall(or, buffer)
        // }
        // public isNotEqual(buffer : Buffer_) : Buffer {
        //     return this.uniformCall(or, buffer)
        // }
        // public toNumber(buffer : Buffer) : Buffer {
        //     return this.uniformCall(Number, buffer)
        // }
        // public add(buffer : Buffer) : Buffer {
        //     return this.uniformCall(add, buffer)
        // }
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
        public call(buffer : Buffer) : Buffer {
            throw new Error // @todo
        }
    }
    class Nothing_ extends Table_ {
    //     public toNothing() {
    //         return this
    //     }
    //     public toBoolean() {
    //         return false_
    //     }
    //     public isEqual(other: Table_) {
    //         return other instanceof Nothing_
    //             ? true_
    //             : false_
    //     }
    }
    class Primitive_<Value> extends Table_ {
        public value : Value

        public constructor({ value } : { value : Value }) {
            super()

            this.value = value
        }
    }
    // class Boolean_ extends Primitive_<boolean> {
    //     public toBoolean() {
    //         return this
    //     }
    //     public isEqual(other: Table_) : Boolean_ {
    //         return other instanceof Boolean_ && other.value === this.value
    //             ? true_
    //             : false_
    //     }
    //     public not() {
    //         return new Boolean_({ value : !this.value })
    //     }
    //     public and(other : Boolean_) {
    //         return new Boolean_({ value : this.value && other.value })
    //     }
    //     public or(other : Boolean_) {
    //         return new Boolean_({ value : this.value || other.value })
    //     }
    // }
    // class Number_ extends Primitive_<number> {
    //     public toBoolean() {
    //         return this.value != 0
    //             ? true_
    //             : false_
    //     }
    //     public toNumber() {
    //         return this
    //     }
    //     public isEqual(other: Table) {
    //         return other instanceof Number_ && other.value === this.value
    //             ? true_
    //             : false_
    //     }
    //     public add([ op, next, other ] : Buffer_) {
    //         const casted = other.toNumber()

    //         if (!(casted instanceof Number_)) throw new Error // @todo

    //         return Buffer_.from([ next, next, new Number_({ value : this.value + casted.value }) ]) // @todo: replace with safe continuation?
    //     }
    //     public subtract([ op, next, other ] : Buffer_) {
    //         const casted = other.toNumber()

    //         if (!(casted instanceof Number_)) throw new Error // @todo

    //         return Buffer_.from([ next, next, new Number_({ value : this.value - casted.value }) ]) // @todo: replace with safe continuation?
    //     }
    //     public multiply([ op, next, other ] : Buffer_) {
    //         const casted = other.toNumber()

    //         if (!(casted instanceof Number_)) throw new Error // @todo

    //         return Buffer_.from([ next, next, new Number_({ value : this.value * casted.value }) ]) // @todo: replace with safe continuation?
    //     }
    //     public divide([ op, next, other ] : Buffer_) {
    //         const casted = other.toNumber()

    //         if (!(casted instanceof Number_)) throw new Error // @todo

    //         return Buffer_.from([ next, next, new Number_({ value : this.value / casted.value }) ]) // @todo: replace with safe continuation?
    //     }
    //     public wholeDivide([ op, next, other ] : Buffer_) {
    //         const x = this.value
    //         const casted = other.toNumber()

    //         if (!(casted instanceof Number_)) throw new Error // @todo

    //         const y = casted.value
    //         const remainder = x % y
    //         const fraction = (x - remainder) / y

    //         return Buffer_.from([ next, next, new Number_({ value : fraction }), new Number_({ value : remainder }) ]) // @todo: replace with safe continuation?
    //     }
    //     public power([ op, next, other ] : Buffer_) {
    //         const casted = other.toNumber()

    //         if (!(casted instanceof Number_)) throw new Error // @todo

    //         return Buffer_.from([ next, next, new Number_({ value : this.value ** casted.value }) ]) // @todo: replace with safe continuation?
    //     }
    //     public root([ op, next, other ] : Buffer_) {
    //         const casted = other.toNumber()

    //         if (!(casted instanceof Number_)) throw new Error // @todo

    //         return Buffer_.from([ next, next, new Number_({ value : this.value ** (1 / casted.value) }) ]) // @todo: replace with safe continuation?
    //     }
    // }
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

        public call(buffer : Buffer) {
            const buffer_ = buffer.slice(0)

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
            const instruction = buffer.at(0)

            if (instruction.halt) return

            const params = buffer.slice(1)

            this.buffer = instruction.call(params)
        }
    }

    // const Nothing = new External_({ value : buffer => buffer.at(2).toNothing(buffer) })
    const nothing = new Nothing_

    // const Boolean = new External_({ value : buffer => buffer.at(2).toBoolean(buffer) })
    // const true_ = new Boolean_({ value : true })
    // const false_ = new Boolean_({ value : false })
    // const not = new External_({ value : buffer => buffer.at(2).not(buffer) })
    // const and = new External_({ value : buffer => buffer.at(2).and(buffer) })
    // const or = new External_({ value : buffer => buffer.at(2).or(buffer) })
    // // @todo: if
    // const isEqual = new External_({ value : buffer => buffer.at(2).isEqual(buffer) })
    // const isNotEqual = new External_({ value : buffer => buffer.at(2).isNotEqual(buffer) })

    // const Number = new External_({ value : buffer => buffer.at(2).toNumber(buffer) })
    // const add = new External_({ value : buffer => buffer.at(2).add(buffer) })
    // const subtract = new External_({ value : buffer => buffer.at(2).add(buffer) })
    // const multiply = new External_({ value : buffer => buffer.at(2).multiply(buffer) })
    // const divide = new External_({ value : buffer => buffer.at(2).divide(buffer) })
    // const wholeDivide = new External_({ value : buffer => buffer.at(2).wholeDivide(buffer) })
    // const power = new External_({ value : buffer => buffer.at(2).power(buffer) })
    // const root = new External_({ value : buffer => buffer.at(2).root(buffer) })

    const bind = new External_({ value : buffer => {
        const [ next, target ] = buffer // const [ op, next, target ] = buffer

        if (!(next instanceof Template_)) throw new Error // @todo
        if (!(target instanceof Template_)) throw new Error // @todo

        const buffer_ = buffer.slice(3)
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
        // nothing,

        // Boolean,
        // true : true_,
        // false : false_,
        // not,
        // and,
        // or,
        // [`==`] : isEqual,
        // [`!=`] : isNotEqual,

        // Number,
        // [`+`] : add,
        // [`-`] : subtract,
        // [`*`] : multiply,
        // [`/`] : divide,
        // [`%`] : wholeDivide,
        // [`**`] : power,
        // [`//`] : root,

        bind,
        createTemplate,
        createInstruction,

        terminal,

        createMachine,
    }
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
