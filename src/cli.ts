#!/usr/bin/env node

import { resolve } from 'path'
import { readFileSync } from 'fs'
import { parse, translate, back } from './l0'

const url = process.argv[2]

if (url) {
    const text = readFileSync(resolve(url), 'utf8')

    // console.log(text)

    const program = parse(text)
    const instruction = translate(program)
    const bind = instruction.buffer[0]

    if (!(bind instanceof back.BindInstruction)) throw new Error

    const filler = new back.Filler({ bind })
    const machine = new back.Machine({ buffer : [
        instruction,
        ...program.parameters.explicit.map(parameter => filler.fill(parameter)),
    ] })

    const begin = new Date

    while (!(machine.instruction instanceof back.TerminalInstruction)) machine.step()

    const end = new Date
    const time = (end.valueOf() - begin.valueOf()) / 1000

    console.log(`completed in ${time} s`)
}

