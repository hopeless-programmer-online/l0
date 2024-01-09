import { default as Wabt } from 'wabt'
import { readFile } from 'fs-extra'

export default async function main() {
    const file = `vm.wat`
    const wat = await readFile(file)
    const wabt = await Wabt()
    const wasm = wabt.parseWat(file, wat).toBinary({}).buffer
    const module = await WebAssembly.compile(wasm)
    const imports = {
        print : {
            int32(value : number) {
                process.stdout.write(`${value}`)
            },
            ascii(begin : number, length : number) {
                // console.log({ begin, length })

                const text = Buffer.from(memory.buffer)
                    .subarray(begin, begin + length)
                    .toString(`ascii`)

                process.stdout.write(`${text}`)
            },
        },
    }
    const instance = await WebAssembly.instantiate(module, imports)
    const memory = instance.exports.memory as WebAssembly.Memory

    const Nothing = instance.exports.Nothing as () => number
    const Terminal = instance.exports.Terminal as () => number
    const Int32 = instance.exports.Int32 as (value : number) => number
    const Array = instance.exports.Array as (length : number) => number
    const Print = instance.exports.Print as () => number
    const Array_set = instance.exports[`Array.set`] as (array : number, i : number, value : number) => void
    const step = instance.exports.step as (buffer : number, nothing : number) => number

    const nothing = Nothing()
    const print = Print()
    const terminal = Terminal()
    const buffer = Array(3)
    const number5 = Int32(5)

    Array_set(buffer, 0, print)
    Array_set(buffer, 1, terminal)
    Array_set(buffer, 2, number5)

    step(buffer, nothing)

    // const run = instance.exports.run as () => number

    // run()

    console.log(`done`)
}

main()
