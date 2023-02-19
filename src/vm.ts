import { Bind, Template, Terminal } from './semantics'
import { formatWithOptions } from 'util'

export class Internal {
    public buffer : any[]
    public template : Template

    public constructor({
        buffer,
        template,
    } : {
        buffer : any[]
        template : Template
    }) {
        this.buffer = buffer
        this.template = template
    }
}
export class External {
    public callback : (buffer : any[]) => any[]

    public constructor({
        callback,
    } : {
        callback : (buffer : any[]) => any[],
    }) {
        this.callback  =callback
    }
}

export default class VirtualMachine {
    public buffer : any[]

    public constructor({ buffer } : { buffer : any[] }) {
        this.buffer = buffer
    }

    public get halted() {
        return this.buffer[0] instanceof Terminal
    }

    public step() {
        const first = this.buffer[0]

        if (first instanceof Internal) {
            const buffer = [
                first,
                ...first.buffer,
                ...this.buffer.slice(1),
            ]

            this.buffer = first.template.targets.map(x => buffer[x])
        }
        else if (first instanceof External) {
            this.buffer = first.callback(this.buffer)
        }
        else if (first instanceof Bind) {
            const continuationTemplate = this.buffer[1]
            const targetTemplate = this.buffer[2]

            if (!(continuationTemplate instanceof Template)) throw new Error // @todo
            if (!(targetTemplate instanceof Template)) throw new Error // @todo

            const buffer = this.buffer.slice(3)
            const continuation = new Internal({ buffer, template : continuationTemplate })
            const target = new Internal({ buffer : buffer.slice(), template : targetTemplate })

            buffer.push(target)

            this.buffer = [ continuation ]
        }
        else throw new Error(`${formatWithOptions({ colors : true }, first)} is not an instruction.`)
    }
}
