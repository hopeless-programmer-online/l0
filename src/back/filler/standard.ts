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
    popBack1(amount? : number) : Something[]
    popFront1(amount? : number) : Something[]

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
    get2(key : Something) : Something
    set2(key : Something, value : Something) : void
    pushBack2(values : Something[]) : void
    pushFront2(values : Something[]) : void
    popBack2(amount : Something) : Something[]
    popFront2(amount : Something) : Something[]
    getType2() : Something
    getTemplate2() : Something

    // toNothing(buffer : Buffer) : Buffer
    toBoolean(buffer : Buffer) : Buffer
    isEqual(buffer : Buffer) : Buffer
    isNotEqual(buffer : Buffer) : Buffer
    not(buffer : Buffer) : Buffer
    and(buffer : Buffer) : Buffer
    or(buffer : Buffer) : Buffer
    toNumber(buffer : Buffer) : Buffer
    add(buffer : Buffer) : Buffer
    subtract(buffer : Buffer) : Buffer
    multiply(buffer : Buffer) : Buffer
    divide(buffer : Buffer) : Buffer
    wholeDivide(buffer : Buffer) : Buffer
    power(buffer : Buffer) : Buffer
    root(buffer : Buffer) : Buffer
    toString(buffer : Buffer) : Buffer
    get(buffer : Buffer) : Buffer
    set(buffer : Buffer) : Buffer
    pushBack(buffer : Buffer) : Buffer
    pushFront(buffer : Buffer) : Buffer
    popBack(buffer : Buffer) : Buffer
    popFront(buffer : Buffer) : Buffer
    getType(params : Buffer) : Buffer
    getTemplate(params : Buffer) : Buffer
    call(params : Buffer) : Buffer
}

type Context = {
    bind : Something
    terminal : Something
    createTemplate(targets : number[], comment? : string) : Something
    createInstruction(template : Something, buffer : Something[]) : Something
    createNamed(name : Name) : Something
    createMachine(buffer : Something[]) : Machine
}

export class Filler extends TranslationFiller<Something, Something, Something> {
    private context = createContext()

    public get bind() {
        return this.context.bind
    }
    public get terminal() {
        return this.context.terminal
    }
    public createTemplate({ targets, comment } : { comment: string; targets: number[] }) : Something {
        return this.context.createTemplate(targets, comment)
    }
    public createInstruction({ template, buffer } : { template: Something; buffer: Something[] }) : Something {
        return this.context.createInstruction(template, buffer)
    }
    public createNamed(name : Name) : Something {
        return this.context.createNamed(name)
    }
    public createMachine({ buffer }: { buffer: Something[] }) {
        return this.context.createMachine(buffer)
    }
}

function createContext() : Context {
    class Something_ implements Something {
        public halt = false

        public toBoolean1() : boolean {
            throw new Error // @todo
        }
        public isEqual1(other: Something): boolean {
            return this === other
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
        public popBack1(amount? : number) : Something[] {
            throw new Error // @todo
        }
        public popFront1(amount? : number) : Something[] {
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
        public get2(key : Something) : Something {
            throw new Error // @todo
        }
        public set2(key : Something, value : Something) : void {
            throw new Error // @todo
        }
        public pushBack2(values : Something[]) {
            throw new Error // @todo
        }
        public pushFront2(values : Something[]) {
            throw new Error // @todo
        }
        public popBack2(amount : Something) : Something[] {
            const amount_ = amount instanceof Nothing_ ? undefined : amount.toNumber1()

            return this.popBack1(amount_)
        }
        public popFront2(amount : Something) : Something[] {
            const amount_ = amount instanceof Nothing_ ? undefined : amount.toNumber1()

            return this.popFront1(amount_)
        }
        public getType2() : Something {
            throw new Error // @todo
        }
        public getTemplate2() : Something {
            throw new Error // @todo
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
        public toString(buffer : Buffer) : Buffer {
            const [ op, next ] = buffer

            return Buffer_.from([ next, next, this.toString2() ])
        }
        public get(buffer : Buffer) : Buffer {
            const [ op, next, me, key ] = buffer

            return Buffer_.from([ next, next, this.get2(key) ])
        }
        public set(buffer : Buffer) : Buffer {
            const [ op, next, me, key, value ] = buffer

            this.set2(key, value)

            return Buffer_.from([ next, next ])
        }
        public pushBack(buffer : Buffer) : Buffer {
            const [ op, next, me ] = buffer
            const values = buffer.slice(3).array

            this.pushBack2(values)

            return Buffer_.from([ next, next ])
        }
        public pushFront(buffer : Buffer) : Buffer {
            const [ op, next, me ] = buffer
            const values = buffer.slice(3).array

            this.pushFront2(values)

            return Buffer_.from([ next, next ])
        }
        public popBack(buffer : Buffer) : Buffer {
            const [ op, next, me, amount ] = buffer

            return Buffer_.from([ next, next, ...this.popBack2(amount) ])
        }
        public popFront(buffer : Buffer) : Buffer {
            const [ op, next, me, amount ] = buffer

            return Buffer_.from([ next, next, ...this.popFront2(amount) ])
        }
        public getType(buffer : Buffer) : Buffer {
            const [ op, next ] = buffer

            return Buffer_.from([ next, next, this.getType2() ])
        }
        public getTemplate(buffer : Buffer) : Buffer {
            const [ op, next ] = buffer

            return Buffer_.from([ next, next, this.getTemplate2() ])
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
        public getType2() : Something {
            return Boolean
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
        public getType2() : Something {
            return Number
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
        public getType2() : Something {
            return String
        }
    }
    class List_ extends Something_ {
        public elements : Something[] = []

        public constructor({ elements = [] } : { elements? : Something[] } = {}) {
            super()

            this.elements = elements
        }

        public toBoolean1() {
            return this.elements.length > 0 ? true : false
        }
        public isEqual1(other : Something) : boolean {
            const { elements } = this

            return other instanceof List_ &&
                other.elements.length === elements.length &&
                other.elements.every((x, i) => i in elements && elements[i].isEqual1(x))
        }
        public toNumber1() {
            return global.Number(this.elements.length)
        }
        public toString1() {
            let elements = this.elements.map(x => x.toString1()).join(colorize(`, `, Colors.fgWhite))

            if (elements.length > 0) elements = ` ${elements} `

            return colorize(`[`, Colors.fgWhite) + elements + colorize(`]`, Colors.fgWhite)
        }
        public popBack1(amount: number = 1) {
            const { elements } = this

            return elements.splice(elements.length - amount, amount)
        }
        public popFront1(amount: number = 1) {
            const { elements } = this

            return elements.splice(0, amount)
        }

        public get2(key : Something) : Something {
            const { elements } = this

            let index = key.toNumber1()

            if (index < 0) index = elements.length + index
            if (index < 0 || index > elements.length - 1) return nothing

            return elements[index]
        }
        public set2(key : Something, value : Something) : void {
            const { elements } = this

            let index = key.toNumber1()

            if (index < 0) index = elements.length + index

            elements[index] = value
        }
        public pushBack2(values : Something[]) {
            this.elements.push(...values)
        }
        public pushFront2(values : Something[]) {
            this.elements.unshift(...values)
        }
        public getType2() : Something {
            return List
        }
        public add2(other: Something) : Something {
            if (!(other instanceof List_)) throw new Error

            return new List_({ elements : [ ...this.elements, ...other.elements ] })
        }
    }
    class Buffer_ extends List_ implements Buffer {
        public static from(elements : Something[]) {
            return new Buffer_({ elements })
        }

        public get array() {
            return this.elements
        }

        public * [Symbol.iterator]() : Generator<Something> {
            for (const parameter of this.elements) yield parameter

            while (true) yield nothing
        }

        public at(index : number) {
            return this.elements[index] || nothing
        }
        public slice(begin : number) {
            return Buffer_.from(this.elements.slice(begin))
        }
        public push(...values: Something[]) {
            this.elements.push(...values)
        }
        public unshift(...values: Something[]) {
            this.elements.unshift(...values)
        }
    }
    class Terminal_ extends Something_ {
        public halt = true

        public toString1(): string {
            return `${colorize(`<`, Colors.fgWhite)}${colorize(`terminal`, Colors.fgMagenta)}${colorize(`>`, Colors.fgWhite)} ${colorize(`program`, Colors.fgBlue)}`
        }
    }
    class Template_ extends Something_ {
        public readonly targets : number[]
        public readonly comment? : string

        public constructor({ targets, comment } : { targets : number[], comment? : string }) {
            super()

            this.targets = targets
            this.comment = comment
        }

        public get targetsAsList() {
            return new List_({ elements : this.targets.map(value => new Number_({ value })) })
        }

        public toString1(): string {
            return `${colorize(`template`, Colors.fgBlue)} ${this.comment ? colorize(`(${this.comment})`, Colors.fgWhite) : ``}`
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

        public get bufferAsList() {
            return new List_({  elements : this.buffer.array.slice() })
        }

        public toString1(): string {
            return `${colorize(`<`, Colors.fgWhite)}${colorize(`internal`, Colors.fgMagenta)}${colorize(`>`, Colors.fgWhite)} ${colorize(`program`, Colors.fgBlue)}`
        }
        public isEqual1(other: Something) : boolean {
            return this === other
        }

        public getType2() : Something {
            return Internal
        }
        public getTemplate2(): Something {
            return this.template
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
        public readonly name : string

        public constructor({ name, value } : { name : string, value : (buffer : Buffer) => Buffer }) {
            super({ value })

            this.name = name
        }

        public isEqual1(other: Something) : boolean {
            return this === other
        }
        public toString1(): string {
            return `${colorize(`<`, Colors.fgWhite)}${colorize(`external`, Colors.fgMagenta)}${colorize(`>`, Colors.fgWhite)} ${colorize(`program`, Colors.fgBlue)} ${colorize(this.name, Colors.fgGreen)}`
        }

        public getType2() : Something {
            return External
        }

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

    const toJson = (something : Something) : string => {
        const all = new Set<Something>()
        const ids = new Map<Something, string>()

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

            if (something instanceof List_) {
                let elements = something.elements.map(stringify).join(colorize(`, `, Colors.fgWhite))

                if (elements.length > 0) elements = ` ${elements} `

                text = colorize(`[`, Colors.fgWhite) + elements + colorize(`]`, Colors.fgWhite)
            }
            else if (something instanceof String_) {
                text = colorize(`${JSON.stringify(something.value)}`, Colors.fgRed)
            }
            else text = something.toString1()

            // get id again as it might have changed during nested stringify()
            id = ids.get(something)

            id = id !== undefined ? `${id} ` : ``

            return `${id}${text}`
        }

        return stringify(something)
    }

    // const Nothing = new External_({ value : buffer => buffer.at(2).toNothing(buffer) })
    const nothing = new Nothing_

    const Boolean = new External_({ name : `Boolean`, value : buffer => buffer.at(2).toBoolean(buffer) })
    const true_ = new Boolean_({ value : true })
    const false_ = new Boolean_({ value : false })
    const not = new External_({ name : `not`, value : buffer => buffer.at(2).not(buffer) })
    const and = new External_({ name : `and`, value : buffer => buffer.at(2).and(buffer) })
    const or = new External_({ name : `or`, value : buffer => buffer.at(2).or(buffer) })
    const if_ = new External_({ name : `if`, value : buffer => {
        const [ op, next, condition, then ] = buffer

        if (condition.toBoolean1()) return Buffer_.from([ then, next ])

        return Buffer_.from([ next, next ])
    } })
    // @todo: if
    const isEqual = new External_({ name : `==`, value : buffer => buffer.at(2).isEqual(buffer) })
    const isNotEqual = new External_({ name : `!=`, value : buffer => buffer.at(2).isNotEqual(buffer) })

    const Number = new External_({ name : `Number`, value : buffer => buffer.at(2).toNumber(buffer) })
    const add = new External_({ name : `+`, value : buffer => buffer.at(2).add(buffer) })
    const subtract = new External_({ name : `-`, value : buffer => buffer.at(2).subtract(buffer) })
    const multiply = new External_({ name : `*`, value : buffer => buffer.at(2).multiply(buffer) })
    const divide = new External_({ name : `/`, value : buffer => buffer.at(2).divide(buffer) })
    const wholeDivide = new External_({ name : `%`, value : buffer => buffer.at(2).wholeDivide(buffer) })
    const power = new External_({ name : `**`, value : buffer => buffer.at(2).power(buffer) })
    const root = new External_({ name : `//`, value : buffer => buffer.at(2).root(buffer) })

    const String = new External_({ name : `String`, value : buffer => buffer.at(2).toString(buffer) })

    const List = new External_({ name : `List`, value : buffer => {
        const [ op, next ] = buffer

        return Buffer_.from([ next, next, new List_ ])
    } })
    const get = new External_({ name : `get`, value : buffer => buffer.at(2).get(buffer) })
    const set = new External_({ name : `set`, value : buffer => buffer.at(2).set(buffer) })
    const push_back = new External_({ name : `push_back`, value : buffer => buffer.at(2).pushBack(buffer) })
    const push_front = new External_({ name : `push_front`, value : buffer => buffer.at(2).pushFront(buffer) })
    const pop_back = new External_({ name : `pop_back`, value : buffer => buffer.at(2).popBack(buffer) })
    const pop_front = new External_({ name : `pop_front`, value : buffer => buffer.at(2).popFront(buffer) })
    const map = new External_({ name : `map`, value : buffer => {
        const [ op, super_, target, callback ] = buffer

        if (!(target instanceof List_)) throw new Error // @todo

        const { elements } = target
        const results : Something[] = []
        let i = 0

        const iterator = new External_({ name : `map iterator`, value : buffer => {
            const result = buffer.at(2)

            if (i > 0) results.push(result)
            if (i >= elements.length) return Buffer_.from([ super_, super_, new List_({ elements : results }) ])

            const nextBuffer = Buffer_.from([ callback, iterator, elements[i], new Number_({ value : i }) ])

            ++i

            return nextBuffer
        } })

        return Buffer_.from([ iterator ])
    }})
    const slice = new External_({ name : `slice`, value : buffer => {
        let [ op, next, target, begin_, end_ ] = buffer

        if (!(target instanceof List_)) throw new Error // @todo

        const begin = begin_ instanceof Nothing_ ? undefined : begin_.toNumber1()
        const end = end_ instanceof Nothing_ ? undefined : end_.toNumber1()
        const elements = target.elements.slice(begin, end)

        return Buffer_.from([ next, next, new List_({ elements }) ])
    }})

    const createNumber = (value : number) => new Number_({ value })
    const createString = (value : string) => new String_({ value })
    const print = new External_({ name : `print`, value : buffer => {
        const [ op, next ] = buffer

        console.log(...buffer.array.slice(2).map(toJson))

        return Buffer_.from([ next, next ])
    } })

    const Internal = new External_({ name : `Internal`, value : () => { throw new Error } })
    const External = new External_({ name : `External`, value : () => { throw new Error } })
    const is_internal = new External_({ name : `is_internal`, value : buffer => {
        const [ op, next, target ] = buffer

        return Buffer_.from([ next, next, target instanceof Internal_ ? true_ : false_ ])
    } })
    const is_external = new External_({ name : `is_external`, value : buffer => {
        const [ op, next, target ] = buffer

        return Buffer_.from([ next, next, target instanceof External_ ? true_ : false_ ])
    } })
    const get_template = new External_({ name : `get_template`, value : buffer => buffer.at(2).getTemplate(buffer) })
    const get_targets = new External_({ name : `get_targets`, value : buffer => {
        const [ op, next, target ] = buffer

        if (!(target instanceof Template_)) throw new Error // @todo

        return Buffer_.from([ next, next, target.targetsAsList ])
    } })
    const get_buffer = new External_({ name : `get_buffer`, value : buffer => {
        const [ op, next, target ] = buffer

        if (!(target instanceof Internal_)) throw new Error // @todo

        return Buffer_.from([ next, next, target.bufferAsList ])
    } })
    const bind = new External_({ name : `bind`, value : buffer => {
        const [ op, next, target ] = buffer

        if (!(next instanceof Template_)) throw new Error // @todo
        if (!(target instanceof Template_)) throw new Error // @todo

        const buffer_ = buffer.slice(3)
        const target_ = new Internal_({ template : target, buffer : buffer_ })
        const next_ = new Internal_({ template : next, buffer : buffer_ })

        buffer_.push(target_)

        return next_.call(Buffer_.from([]))
    } })
    const createTemplate = (targets : number[], comment? : string) => new Template_({ targets, comment })
    const createInstruction = (template : Something, buffer : Something[]) => {
        if (!(template instanceof Template_)) throw new Error // @todo

        const buffer_ = Buffer_.from(buffer)

        return new Internal_({ template, buffer : buffer_ })
    }

    const type_of = new External_({ name : `type_of`, value : buffer => buffer.at(2).getType(buffer) })
    const terminal = new Terminal_

    const createMachine = (buffer : Something[]) => new Machine_({ buffer : Buffer_.from(buffer) })
    const createNamed = (name : Name) : Something => {
        const { text } = name

        const number = text.match(/^-?(?:\d|\s)+(?:\.(?:\d|\s)+)?(?:e(?:\s)*-?(?:\d|\s)+(?:\.(?:\d|\s)+)?)?$/)

        if (number) {
            const value = global.Number(text.replace(/\s/g, ``))

            return createNumber(value)
        }

        try {
            const string = JSON.parse(text)

            if (typeof string === `string`) return createString(string)
        }
        catch(error) {
            // do nothing
        }

        switch (text) {
            // case `Nothing`: return Nothing
            case `nothing`: return nothing

            case `Boolean`: return Boolean
            case `true`: return true_
            case `false`: return false_
            case `not`: return not
            case `and`: return and
            case `or`: return or
            case `==`: return isEqual
            case `!=`: return isNotEqual
            case `if`: return if_

            case `Number`: return Number
            case `+`: return add
            case `-`: return subtract
            case `*`: return multiply
            case `/`: return divide
            case `%`: return wholeDivide
            case `**`: return power
            case `//`: return root

            case `String`: return String

            case `List`: return List
            case `get`: return get
            case `set`: return set
            case `push_back`: return push_back
            case `push_front`: return push_front
            case `pop_back`: return pop_back
            case `pop_front`: return pop_front
            case `map`: return map
            case `slice`: return slice

            case `print`: return print

            case `bind`: return bind
            case `Internal`: return Internal
            case `External`: return External
            case `is_internal`: return is_internal
            case `is_external`: return is_external
            case `get_template`: return get_template
            case `get_targets`: return get_targets
            case `get_buffer`: return get_buffer

            case `type_of`: return type_of
            // case `super`: return super
        }

        throw new Error(`Can't fill name with text "${text}"`)
    }

    return {
        bind,
        terminal,
        createTemplate,
        createInstruction,
        createMachine,
        createNamed,
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
