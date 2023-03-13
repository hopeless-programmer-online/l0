import { formatWithOptions } from 'util'
import { neverThrow } from './utilities'

export type Anything<
    Nothing_ extends Nothing,
    Something_ extends Something,
    Terminal_ extends Terminal,
    Internal_ extends Internal<Nothing_, Something_, Terminal_, Internal_, External_>,
    External_ extends External<Nothing_, Something_, Terminal_, Internal_, External_>,
> =
    | Nothing_
    | Something_
    | Terminal_
    | Internal_
    | External_

export class Nothing {
    public static readonly symbol : unique symbol = Symbol(`l0.vm.Nothing`)

    public readonly symbol : typeof Nothing.symbol = Nothing.symbol
}

export class Something {
    public static readonly symbol : unique symbol = Symbol(`l0.vm.Something`)

    public readonly symbol : typeof Something.symbol = Something.symbol
}

export class Terminal {
    public static readonly symbol : unique symbol = Symbol(`l0.vm.Terminal`)

    public readonly symbol : typeof Terminal.symbol = Terminal.symbol
}

export abstract class Internal<
    Nothing_ extends Nothing,
    Something_ extends Something,
    Terminal_ extends Terminal,
    Internal_ extends Internal<Nothing_, Something_, Terminal_, Internal_, External_>,
    External_ extends External<Nothing_, Something_, Terminal_, Internal_, External_>,
> {
    public static readonly symbol : unique symbol = Symbol(`l0.vm.Internal`)

    public readonly symbol : typeof Internal.symbol = Internal.symbol

    public abstract get targets() : number[]
    public abstract get closure() : Anything<Nothing_, Something_, Terminal_, Internal_, External_>[]
}

export abstract class External<
    Nothing_ extends Nothing,
    Something_ extends Something,
    Terminal_ extends Terminal,
    Internal_ extends Internal<Nothing_, Something_, Terminal_, Internal_, External_>,
    External_ extends External<Nothing_, Something_, Terminal_, Internal_, External_>,
> {
    public static readonly symbol : unique symbol = Symbol(`l0.vm.External`)

    public readonly symbol : typeof External.symbol = External.symbol

    public abstract call(
        buffer : Buffer<Nothing_, Something_, Terminal_, Internal_, External_>
    ) : Buffer<Nothing_, Something_, Terminal_, Internal_, External_>
}

export class Buffer<
    Nothing_ extends Nothing,
    Something_ extends Something,
    Terminal_ extends Terminal,
    Internal_ extends Internal<Nothing_, Something_, Terminal_, Internal_, External_>,
    External_ extends External<Nothing_, Something_, Terminal_, Internal_, External_>,
> {
    private _list : Anything<Nothing_, Something_, Terminal_, Internal_, External_>[]

    public readonly nothing : Nothing_

    public constructor({
        list,
        nothing,
    } : {
        list : Anything<Nothing_, Something_, Terminal_, Internal_, External_>[]
        nothing : Nothing_
    }) {
        this._list = list
        this.nothing = nothing
    }

    public get list() {
        return this._list
    }
    public get first() {
        return this.get(0)
    }

    public get(index : number) : Anything<Nothing_, Something_, Terminal_, Internal_, External_> {
        return this.list[index] || this.nothing
    }
}

export default class VirtualMachine<
    Nothing_ extends Nothing,
    Something_ extends Something,
    Terminal_ extends Terminal,
    Internal_ extends Internal<Nothing_, Something_, Terminal_, Internal_, External_>,
    External_ extends External<Nothing_, Something_, Terminal_, Internal_, External_>,
> {
    public buffer : Buffer<Nothing_, Something_, Terminal_, Internal_, External_>
    public readonly nothing : Nothing_

    public constructor({ buffer } : { buffer : Buffer<Nothing_, Something_, Terminal_, Internal_, External_> }) {
        this.buffer = buffer
        this.nothing = buffer.nothing
    }

    public get halted() {
        return this.buffer.first.symbol === Terminal.symbol
    }

    public step() {
        const { first } = this.buffer

        // console.log(`step: ${formatWithOptions({ colors : true, depth : 0 }, first)}`)

        if (first.symbol === Nothing.symbol) throw new Error(`Cannot call nothing: ${first}.`)
        else if (first.symbol === Something.symbol) throw new Error(`Cannot call: ${first}.`)
        else if (first.symbol === Terminal.symbol) return
        else if (first.symbol === Internal.symbol) {
            // @todo: optimize?
            const restored = new Buffer({
                nothing : this.nothing,
                list : [
                    first,
                    ...first.closure,
                    ...this.buffer.list.slice(1),
                ],
            })

            // console.log(formatWithOptions({ colors : true, depth : 1 }, restored.list))
            // console.log(first.targets)

            this.buffer = new Buffer({
                nothing : this.nothing,
                list : first.targets.map(x => restored.get(x)),
            })
        }
        else if (first.symbol === External.symbol) {
            this.buffer = first.call(this.buffer)
        }
        else neverThrow(first, new Error(`Unexpected value: ${first}.`))
    }
}
