#!/usr/bin/env node

import { resolve } from 'path'
import { readFileSync } from 'fs'
import { parse, translate, back } from './l0'
import { Filler } from './back/filler/standard'

const url = process.argv[2]

if (url) {
    const text = readFileSync(resolve(url), 'utf8')

    const program = parse(text)
    const filler = new Filler
    const machine = translate(program, filler)

    const begin = new Date

    while (!machine.halted) machine.step()

    const end = new Date
    const time = (end.valueOf() - begin.valueOf()) / 1000

    console.log(`completed in ${time} s`)
}

