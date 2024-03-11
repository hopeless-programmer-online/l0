import * as path from 'path'
import { readFile } from 'fs-extra'
import { default as Wabt } from 'wabt'
import * as syntax from './syntax'
import * as semantics from './semantics'

type Address = number

export class Context {
    public static async create() {
        const file = path.join(__dirname, `wasm/engine.wat`)
        const wat = await readFile(file)
        const wabt = await Wabt()
        const wasm = wabt.parseWat(file, wat).toBinary({}).buffer
        const module = await WebAssembly.compile(wasm)
        const imports = {
            print : {
                int32(value : number) {
                    process.stdout.write(`${value}`)
                },
                ascii(begin : number, length : number) {
                    // console.log({ begin, length })

                    const text = Buffer.from(memory.buffer)
                        .subarray(begin, begin + length)
                        .toString(`ascii`)

                    process.stdout.write(`${text}`)
                },
            },
        }
        const instance = await WebAssembly.instantiate(module, imports)
        const { exports } = instance
        const memory = exports.memory as WebAssembly.Memory

        return new Context({ exports, memory })
    }

    private memory                     : WebAssembly.Memory
    private readonly nothing           : Address
    private readonly terminal          : Address
    private readonly Template          : (targets : number) => Address
    private readonly template_first    : (template : Address) => Address
    private readonly bind              : Address
    private readonly print             : Address
    private readonly array             : (length : number) => Address
    private readonly array_set         : (array : Address, i : number, v : Address) => void
    private readonly int32             : (value : number) => Address
    private readonly ascii             : (length : number) => Address
    private readonly ascii_data        : (ascii : Address) => Address
    private readonly Internal          : (targets : number, storage : number) => Address
    private readonly internal_targets  : (internal : Address) => Address
    private readonly internal_storage  : (internal : Address) => Address
    private readonly _step             : (buffer : Address) => Address
    private readonly _print            : (something : Address) => void
    private readonly add               : Address
    private readonly sub               : Address
    private readonly mul               : Address
    private readonly div               : Address
    private readonly length            : Address
    private readonly less              : Address
    private readonly less_equal        : Address
    private readonly greater           : Address
    private readonly greater_equal     : Address
    private readonly if                : Address

    public constructor({ exports, memory } : { exports : WebAssembly.Exports, memory : WebAssembly.Memory }) {
        const Nothing          = exports.Nothing as () => Address
        const nothing          = Nothing()
        const Terminal         = exports.Terminal as () => Address
        const terminal         = Terminal()
        const Template         = exports.Template as (targets : number) => Address
        const template_first   = exports[`Template.first`] as (template : Address) => Address
        const Bind             = exports.Bind as () => Address
        const bind             = Bind()
        const Print            = exports.Print as () => Address
        const print            = Print()
        const Array            = exports.Array as (length : number) => Address
        const array_set        = exports[`Array.set`] as (array : Address, i : number, v : Address) => void
        const Int32            = exports.Int32 as (value : number) => Address
        const ASCII            = exports.ASCII as (length : number) => Address
        const ASCII_data       = exports.ASCII_data as (ascii : Address) => Address
        const Internal         = exports.Internal as (targets : number, storage : number) => Address
        const internal_targets = exports[`Internal.targets`] as (internal : Address) => Address
        const internal_storage = exports[`Internal.storage`] as (internal : Address) => Address
        const step             = exports.step as (buffer : Address) => Address
        const _print           = exports._print as (something : Address) => void
        const Add              = exports.Add as () => Address
        const add              = Add()
        const Sub              = exports.Sub as () => Address
        const sub              = Sub()
        const Mul              = exports.Mul as () => Address
        const mul              = Mul()
        const Div              = exports.Div as () => Address
        const div              = Div()
        const Length           = exports.Length as () => Address
        const length           = Length()
        const Less             = exports.Less as () => Address
        const less             = Less()
        const LessEqual        = exports.LessEqual as () => Address
        const less_equal       = LessEqual()
        const Greater          = exports.Greater as () => Address
        const greater          = Greater()
        const GreaterEqual     = exports.GreaterEqual as () => Address
        const greater_equal    = GreaterEqual()
        const If               = exports.If as () => Address
        const if_              = If()

        this.memory           = memory
        this.nothing          = nothing
        this.terminal         = terminal
        this.Template         = Template
        this.template_first   = template_first
        this.bind             = bind
        this.print            = print
        this.array            = Array
        this.array_set        = array_set
        this.int32            = Int32
        this.ascii            = ASCII
        this.ascii_data       = ASCII_data
        this.Internal         = Internal
        this.internal_targets = internal_targets
        this.internal_storage = internal_storage
        this._step            = step
        this._print           = _print
        this.add              = add
        this.sub              = sub
        this.mul              = mul
        this.div              = div
        this.length           = length
        this.less             = less
        this.less_equal       = less_equal
        this.greater          = greater
        this.greater_equal    = greater_equal
        this.if               = if_
    }

    private template(targets : number[]) {
        const template = this.Template(targets.length)
        const first = this.template_first(template)
        const memory = Buffer.from(this.memory.buffer)

        targets.forEach((x, i) => memory.writeUInt32LE(x, first + i*4))

        return template
    }
    private internal(entry : semantics.Entry) {
        const { dependencies, entryTemplate : template } = entry
        const internal = this.Internal(template.targets.length, dependencies.length)
        const first_targets = this.internal_targets(internal)
        const first_storage = this.internal_storage(internal)
        const memory = Buffer.from(this.memory.buffer)

        template.targets.forEach((target, i) => {
            memory.writeUInt32LE(target, first_targets + i*4)
        })
        dependencies.forEach((dependency, i) => {
            // console.log(dependency)

            const value = this.resolve(dependency)

            // this._print(value)

            memory.writeUInt32LE(value, first_storage + i*4)
        })

        return internal
    }
    private resolve(value : semantics.Value) : Address {
        if (value.symbol === semantics.Template.symbol) return this.template(value.targets)
        if (value.symbol === semantics.Bind.symbol) return this.bind
        if (value.symbol === semantics.Terminal.symbol) return this.terminal
        if (value.symbol !== semantics.Named.symbol) neverThrow(value, new Error) // @todo
        // if (value.symbol !== semantics.Named.symbol) throw new Error // @todo

        const { name } = value
        const text = name.toString()

        switch (text) {
        //     case `super`        : return this.terminal
            case `bind`         : return this.bind
            case `print`        : return this.print

            case `nothing`      : return this.nothing

        //     case `type`         : return this.type

        //     case `var`          : return this.var
        //     case `=`            : return this.equal

        //     case `Internal`     : return this.Internal
        //     case `get_closure`  : return this.getClosure
        //     case `get_template` : return this.getTemplate
        //     case `Template`     : return this.Template
        //     case `get_targets`  : return this.getTargets
        //     case `get_comment`  : return this.getComment

        //     case `External`     : return this.External

        //     case `Boolean`      : return this.Boolean
        //     case `true`         : return this.true
        //     case `false`        : return this.false
        //     case `==`           : return this.isEqual
        //     case `!=`           : return this.isNotEqual
        //     case `not`          : return this.not
        //     case `and`          : return this.and
        //     case `or`           : return this.or
            case `if`           : return this.if

        //     case `Int32`        : return this.Int32
            case `+`            : return this.add
            case `-`            : return this.sub
            case `*`            : return this.mul
            case `/`            : return this.div
            case `<`            : return this.less
            case `<=`           : return this.less_equal
            case `>`            : return this.greater
            case `>=`           : return this.greater_equal

        //     case `UTF8String`   : return this.UTF8String

            case `length`       : return this.length
        //     case `get`          : return this.get
        //     case `set`          : return this.set
        //     case `List`         : return this.List
        //     case `push_back`    : return this.pushBack
        //     case `push_front`   : return this.pushFront
        //     case `pop_back`     : return this.popBack
        //     case `pop_front`    : return this.popFront
        //     case `insert`       : return this.insert
        //     case `remove`       : return this.remove
        }

        if (name.words.length === 1 && name.words[0].symbol === syntax.QuotedWord.symbol) {
            const { unquoted : text } = name.words[0]
            const ascii = this.ascii(text.length)
            const memory = Buffer.from(this.memory.buffer)
            const begin = this.ascii_data(ascii)

            Array.from(text).forEach((x, i) => {
                memory.writeUInt8(x.charCodeAt(0), begin + i)
            })

            return ascii
        }

        const int32 = text.match(/^(?:-|\+)?\s*(?:\d\s*)+$/)

        if (int32) return this.int32(Number(int32[0].replace(/\s/g, ``)))

        throw new Error(`Cannot fill name ${text}.`)
    }

    public fill_buffer(entry : semantics.Entry) {
        const internal = this.internal(entry)
        const array = this.array(1)

        this.array_set(array, 0, internal)

        return array
    }
    public step(buffer : Address) {
        return this._step(buffer)
    }
}

function neverThrow(never : never, error : Error) {
    throw error
}
