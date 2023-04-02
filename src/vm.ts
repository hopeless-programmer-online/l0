export * as standard from './vm/standard'
export const call : unique symbol = Symbol(`l0.vm.Something.call`)
export const terminal : unique symbol = Symbol(`l0.vm.Something.terminal`)

export class Anything<Anything_ extends Anything<Anything_>> {
    public [call](buffer : Buffer<Anything_>) : Buffer<Anything_> | typeof terminal {
        throw new Error // @todo
    }
}

export class Buffer<Anything_ extends Anything<Anything_>> {
    private _list : Anything_[]
    public readonly nothing : Anything_

    public constructor({
        list,
        nothing,
    } : {
        list : Anything_[]
        nothing : Anything_
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
    public get tail() {
        return this.list.slice(1)
    }

    public * [Symbol.iterator]() {
        yield * this._list

        while (true) yield this.nothing
    }

    public get(index : number) : Anything_ {
        return this.list[index] || this.nothing
    }
}

export default class VirtualMachine<Anything_ extends Anything<Anything_>> {
    public buffer : Buffer<Anything_> | typeof terminal
    public readonly nothing : Anything<Anything_>

    public constructor({ buffer } : { buffer : Buffer<Anything_> }) {
        this.buffer = buffer
        this.nothing = buffer.nothing
    }

    public get halted() {
        return this.buffer === terminal
    }

    public step() {
        const { buffer } = this

        if (buffer === terminal) return

        const { first } = buffer

        this.buffer = first[call](buffer)

//         const restored = new Buffer({
//             nothing : this.nothing,
//             list : [
//                 first,
//                 ...first.closure,
//                 ...this.buffer.list.slice(1),
//             ],
//         })
//
//         // console.log(formatWithOptions({ colors : true, depth : 1 }, restored.list))
//         // console.log(first.targets)
//
//         this.buffer = new Buffer({
//             nothing : this.nothing,
//             list : first.targets.map(x => restored.get(x)),
//         })
    }
}
