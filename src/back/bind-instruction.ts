import External from './external-instruction'
import Internal from './internal-instruction'
import Template from './template'

export default class BindInstruction extends External {
    public constructor() {
        super({ callback })
    }
}

export function callback(buffer : any[]) {
    const declarationTemplate = buffer[2]

    if (!(declarationTemplate instanceof Template)) throw new Error // @todo

    const globals = buffer.slice(3)
    const declaration = new Internal({
        template : declarationTemplate,
        buffer   : globals,
    })

    // modifies declaration.buffer
    globals.push(declaration)

    const nextTemplate = buffer[1]

    if (!(nextTemplate instanceof Template)) throw new Error // @todo

    const next = new Internal({
        template : nextTemplate,
        buffer   : [ ...globals ], // already contains declaration via push
    })

    return [
        next,
        ...globals,
        declaration,
    ]
}
