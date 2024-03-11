#!/usr/bin/env node

import { readFile } from 'fs-extra'
import * as lexis from './lexis'
import * as syntax from './syntax'
import * as semantics from './semantics'
import * as vm from './vm'
import * as wasm from './wasm'

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

export class Cli {
    public async run(params? : Params) {
        if (!params) params = Params.fromProcess()

        const text = await readFile(params.path, `utf8`)
        const lexisAnalyzer = new lexis.Analyzer
        const lexemes = stopwatch(() => lexisAnalyzer.analyze(text), `lexis analysis completed`)
        const syntaxAnalyzer = new syntax.Analyzer
        const main = stopwatch(() => syntaxAnalyzer.analyze(lexemes), `syntax analysis completed`)
        const semanticsAnalyzer = new semantics.Analyzer
        const entry = stopwatch(() => semanticsAnalyzer.analyze(main), `semantic analysis completed`)
        const context = await wasm.Context.create()
        let buffer = context.fill_buffer(entry)

        stopwatch(() => {
            while (buffer !== 0) {
                buffer = context.step(buffer)
                // ++statistics.total
            }
        }, `executed`)

        /*{
            const lengths = [ ...statistics.buffer.values() ].sort()
            const min = lengths.reduce((a, x) => Math.min(a, x), +Infinity)
            const max = lengths.reduce((a, x) => Math.max(a, x), -Infinity)
            const mean = lengths.reduce((a, x) => a + x, 0) / lengths.length
            const mae = lengths.reduce((a, x) => a + Math.abs(x - mean), 0) / lengths.length
            const sd = lengths.reduce((a, x) => a + (x - mean)**2, 0)**0.5
            const median = lengths[Math.floor(lengths.length / 2)]

            console.log(`buffer lengths statistics:`)
            console.log(` - records : ${lengths.length}`)
            console.log(` - min     : ${min}`)
            console.log(` - max     : ${max}`)
            console.log(` - mean    : ${mean}`)
            console.log(` - median  : ${median}`)
            console.log(` - mae     : ${mae}`)
            console.log(` - sd      : ${sd}`)
        }
        {
            const lengths = [ ...statistics.closure.values() ].sort()
            const min = lengths.reduce((a, x) => Math.min(a, x), +Infinity)
            const max = lengths.reduce((a, x) => Math.max(a, x), -Infinity)
            const mean = lengths.reduce((a, x) => a + x, 0) / lengths.length
            const mae = lengths.reduce((a, x) => a + Math.abs(x - mean), 0) / lengths.length
            const sd = lengths.reduce((a, x) => a + (x - mean)**2, 0)**0.5
            const median = lengths[Math.floor(lengths.length / 2)]

            console.log(`closure lengths statistics:`)
            console.log(` - records : ${lengths.length}`)
            console.log(` - min     : ${min}`)
            console.log(` - max     : ${max}`)
            console.log(` - mean    : ${mean}`)
            console.log(` - median  : ${median}`)
            console.log(` - mae     : ${mae}`)
            console.log(` - sd      : ${sd}`)
        }

        console.log(`internal / all: ${statistics.internals / statistics.total}`)*/
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
