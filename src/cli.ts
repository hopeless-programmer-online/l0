import { readFile } from 'fs-extra'
import { Analyzer as LexisAnalyzer } from './lexis'
import { Analyzer as SyntaxAnalyzer, QuotedWord } from './syntax'
import { Analyzer as SemanticsAnalyzer, Bind, Named, Template, Terminal } from './semantics'
import  Machine, { Internal, External } from './vm'
import { neverThrow } from './utilities'

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

            if (name.toString() === `print`) return new External({ callback : ([ me, next, ...params ]) => {
                console.log(...params)

                return [ next, next ]
            } })
            if (name.words.length === 1 && name.words[0].symbol === QuotedWord.symbol) return name.words[0].unquoted

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
