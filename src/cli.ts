import { readFile } from 'fs-extra'
import * as lexis from './lexis'
import * as syntax from './syntax'
import * as semantics from './semantics'
import Machine, * as vm from './vm'
import { neverThrow } from './utilities'
import { formatWithOptions } from 'util'

export type Path = string

export class Params {
    public static fromProcess() {
        const path = process.argv[2]
        const params = new Params({ path })

        return params
    }

    public readonly path : Path

    public constructor({ path } : { path : Path }) {
        this.path = path
    }
}

type Anything = vm.Anything<Nothing, Something, Terminal, Internal, External>

class Nothing extends vm.Nothing {
}

class Something extends vm.Something {
}

class String extends Something {
    public static from(word : syntax.QuotedWord) {
        return new String({ value : word.unquoted })
    }

    public readonly value : string

    public constructor({ value } : { value : string }) {
        super()

        this.value = value
    }
}

class Template extends Something {
    public static from(template : semantics.Template) {
        return new Template({ targets : template.targets.slice(), comment : template.comment })
    }

    public readonly targets : number[]
    public readonly comment? : string

    public constructor({ targets, comment } : { targets : number[], comment? : string }) {
        super()

        this.targets = targets
        this.comment = comment
    }
}

class Terminal extends vm.Terminal {
}

class Internal extends vm.Internal<Nothing, Something, Terminal, Internal, External> {
    public readonly template : Template
    public readonly closure : Anything[]

    public constructor({ template, closure } : { template : Template, closure : Anything[] }) {
        super()

        this.template = template
        this.closure = closure
    }

    public get targets() {
        return this.template.targets
    }
}

class External extends vm.External<Nothing, Something, Terminal, Internal, External> {
    public readonly name : string
    public readonly callback : (buffer : Buffer) => Buffer

    public constructor({ name, callback } : { name : string, callback : (buffer : Buffer) => Buffer }) {
        super()

        this.name = name
        this.callback = callback
    }

    public call(buffer : Buffer) : Buffer {
        return this.callback(buffer)
    }
}

type Buffer = vm.Buffer<Nothing, Something, Terminal, Internal, External>

export default class Cli {
    public async run(params? : Params) {
        if (!params) params = Params.fromProcess()

        const text = await readFile(params.path, `utf8`)
        const lexisAnalyzer = new lexis.Analyzer
        const lexemes = stopwatch(() => lexisAnalyzer.analyze(text), `lexis analysis completed`)
        const syntaxAnalyzer = new syntax.Analyzer
        const main = stopwatch(() => syntaxAnalyzer.analyze(lexemes), `syntax analysis completed`)
        const semanticsAnalyzer = new semantics.Analyzer
        const entry = stopwatch(() => semanticsAnalyzer.analyze(main), `semantic analysis completed`)
        const nothing = new Nothing

        function external(name : string, callback : (buffer : Buffer) => Buffer) {
            return new External({ name, callback })
        }
        function result(...list : Anything[]) {
            return new vm.Buffer<Nothing, Something, Terminal, Internal, External>({ nothing, list })
        }

        const terminal = new Terminal
        const bind = external(`bind`, buffer => {
            const continuationTemplate = buffer.get(1)
            const targetTemplate = buffer.get(2)

            if (!(continuationTemplate instanceof Template)) throw new Error // @todo
            if (!(targetTemplate instanceof Template)) throw new Error // @todo

            const closure = buffer.list.slice(3)
            const continuation = new Internal({ closure, template : continuationTemplate })
            // const target = new Internal({ closure : closure.slice(), template : targetTemplate })
            const target = new Internal({ closure : closure, template : targetTemplate })

            closure.push(target)

            return result(continuation)
        })
        const print = external(`print`, buffer => {
            console.log(...buffer.list.slice(2))

            const next = buffer.get(1)

            return result(next, next)
        })

        const closure = entry.dependencies.map<Anything>(value => {
            if (value.symbol === semantics.Template.symbol) return Template.from(value)
            if (value.symbol === semantics.Bind.symbol) return bind
            if (value.symbol === semantics.Terminal.symbol) return terminal
            if (value.symbol !== semantics.Named.symbol) neverThrow(value, new Error) // @todo

            const { name } = value
            const text = name.toString()

            if (text === `super`) return terminal
            if (text === `print`) return print
            if (name.words.length === 1 && name.words[0].symbol === syntax.QuotedWord.symbol) return String.from(name.words[0])

//             const numberMatch = text.match(/^-?\s*\d+(?:\d|\s)*(?:\.\s*\d+(?:\d|\s)*)?$/)
//
//             if (numberMatch) {
//                 const number = Number(numberMatch[0].replace(/\s/g, ``))
//
//                 return number
//             }

            throw new Error // @todo
        })
        const buffer = new vm.Buffer<Nothing, Something, Terminal, Internal, External>({
            nothing,
            list : [ new Internal({ closure, template : Template.from(entry.entryTemplate) }) ],
        })
        const machine = new Machine<Nothing, Something, Terminal, Internal, External>({ buffer })

        function indent(text : string) {
            if (text.length < 1) return text

            return text.replace(/^/g, `    `).replace(/\n/g, `\n    `)
        }
        function stringify(x : Anything | Anything[], options : { newline? : boolean } = { newline : true }) : string {
            const { newline } = options

            if (Array.isArray(x)) {
                let content = x.map(x => stringify(x, options)).join(newline ? `,\n` : `, `)

                if (newline) content = indent(content)

                return `[${content.length > 0 ? `\n${content}\n` : ``}]`
            }
            if (x.symbol === Terminal.symbol) return `terminal`
            if (x.symbol === Nothing.symbol) return `nothing`
            if (x.symbol === Something.symbol) {
                if (x instanceof Template) return `template (${x.comment})`

                return global.String(x)
            }
            if (x.symbol === Internal.symbol) {
                return `internal (${x.template.comment}) {\n` +
                    `    closure : ${indent(stringify(x.closure))}\n` +
                    `    targets : ${x.targets}\n` +
                    `}`
            }
            if (x.symbol === External.symbol) return `external (${x.name})`

            neverThrow(x, new Error)
        }

        stopwatch(() => {
            for (let i = 0; !machine.halted; ++i) {
                // if (i > 10) break

                console.log(`step #${i}`)
                // console.log(machine.buffer.list.map(x => indent(stringify(x))).join(`\n`))
                // console.log(formatWithOptions({ colors : true, depth : 4 }, machine.buffer.first))

                machine.step()
            }
        }, `executed`)
    }
}

function stopwatch<T>(callback : () => T, title : string) {
    const begin = new Date
    const result = callback()
    const end = new Date
    const delta = end.valueOf() - begin.valueOf()

    console.log(`${title} in ${delta} ms`)

    return result
}

async function main() {
    const cli = new Cli

    await cli.run()
}

main()
