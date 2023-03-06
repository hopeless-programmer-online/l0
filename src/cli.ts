import { readFile } from 'fs-extra'
import { Analyzer as LexisAnalyzer } from './lexis'
import { Analyzer as SyntaxAnalyzer, BareWord, QuotedWord } from './syntax'
import { Analyzer as SemanticsAnalyzer, Bind, Named, Template, Terminal } from './semantics'
import  Machine, { Internal, External } from './vm'
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

// class Variable {
//     public target : any
//
//     public constructor({ target } : { target : any }) {
//         this.target = target
//     }
// }

export default class Cli {
    public async run(params? : Params) {
        if (!params) params = Params.fromProcess()

        const text = await readFile(params.path, `utf8`)
        const lexisAnalyzer = new LexisAnalyzer
        const lexemes = stopwatch(() => lexisAnalyzer.analyze(text), `lexis analysis completed`)
        const syntaxAnalyzer = new SyntaxAnalyzer
        const main = stopwatch(() => syntaxAnalyzer.analyze(lexemes), `syntax analysis completed`)
        const semanticsAnalyzer = new SemanticsAnalyzer
        const entry = stopwatch(() => semanticsAnalyzer.analyze(main), `semantic analysis completed`)
        const buffer = entry.dependencies.map(value => {
            if (value.symbol === Template.symbol) return value
            if (value.symbol === Bind.symbol) return value
            if (value.symbol === Terminal.symbol) return value
            if (value.symbol !== Named.symbol) neverThrow(value, new Error) // @todo

            const { name } = value
            const text = name.toString()

            if (text === `true`) return true
            if (text === `false`) return false
            if (text === `print`) return new External({ callback : ([ me, next, ...params ]) => {
                console.log(...params)

                return [ next, next ]
            } })
            if (text === `not`) return new External({ callback : ([ me, next, a ]) => {
                return [ next, next, !a ]
            } })
            if (text === `and`) return new External({ callback : ([ me, next, a, b ]) => {
                return [ next, next, a && b ]
            } })
            if (text === `or`) return new External({ callback : ([ me, next, a, b ]) => {
                return [ next, next, a || b ]
            } })
            // if (text === `+`) return new External({ callback : ([ me, next, a, b ]) => {
            //     return [ next, next, a + b ]
            // } })
            // if (text === `-`) return new External({ callback : ([ me, next, a, b ]) => {
            //     return [ next, next, a - b ]
            // } })
            // if (text === `*`) return new External({ callback : ([ me, next, a, b ]) => {
            //     return [ next, next, a * b ]
            // } })
            // if (text === `/`) return new External({ callback : ([ me, next, a, b ]) => {
            //     return [ next, next, a / b ]
            // } })
            if (name.words.length === 1 && name.words[0].symbol === QuotedWord.symbol) return name.words[0].unquoted

//             const numberMatch = text.match(/^-?\s*\d+(?:\d|\s)*(?:\.\s*\d+(?:\d|\s)*)?$/)
//
//             if (numberMatch) {
//                 const number = Number(numberMatch[0].replace(/\s/g, ``))
//
//                 return number
//             }

            throw new Error // @todo
        })
        const machine = new Machine({ buffer : [
            new Internal({ buffer, template : entry.entryTemplate })
        ] })

        stopwatch(() => {
            for (let i = 0; !machine.halted; ++i) {
                // console.log(`step #${i}`)
                // console.log(formatWithOptions({ colors : true, depth : 4 }, machine.buffer))

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
