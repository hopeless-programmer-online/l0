#!/usr/bin/env node

import { readFile } from 'fs-extra'
import * as lexis from './lexis'
import * as syntax from './syntax'
import * as semantics from './semantics'
import Machine, * as vm from './vm'
import Context, * as std from './vm/standard'

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
        const lexisAnalyzer = new lexis.Analyzer
        const lexemes = stopwatch(() => lexisAnalyzer.analyze(text), `lexis analysis completed`)
        const syntaxAnalyzer = new syntax.Analyzer
        const main = stopwatch(() => syntaxAnalyzer.analyze(lexemes), `syntax analysis completed`)
        const semanticsAnalyzer = new semantics.Analyzer
        const entry = stopwatch(() => semanticsAnalyzer.analyze(main), `semantic analysis completed`)
        const context = new Context
        const closure = entry.dependencies.map(value => context.resolve(value))
        const buffer = new vm.Buffer<std.Anything>({
            nothing : context.nothing,
            list : [ new std.Internal({ closure, template : std.Template.from(entry.entryTemplate) }) ],
        })
        const machine = new Machine({ buffer })

        stopwatch(() => {
            for (let i = 0; !machine.halted; ++i) {
                // console.log(`step #${i}`)

                const { buffer } = machine

//                 if (buffer != vm.terminal) buffer.list.forEach(x => console.log(std.toFormatString(x)))
//
//                 if (i === 8) {
//                     console.log(`----------------------`)
//
//                     if (buffer != vm.terminal) {
//                         const { first } = buffer
//
//                         if (first instanceof std.Internal) {
//                             const x = [
//                                 buffer.first,
//                                 ...first.closure,
//                                 ...buffer.tail,
//                             ]
//
//                             x.forEach(x => console.log(std.toFormatString(x)))
//                         }
//                     }
//
//                     console.log(`----------------------`)
//                 }

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
