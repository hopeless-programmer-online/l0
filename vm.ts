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
            number(value : number) {
                console.log(value)
            },
        },
    }
    const instance = await WebAssembly.instantiate(module, imports)
    const memory = instance.exports.memory as WebAssembly.Memory
    const run = instance.exports.run as () => number

    run()

    console.log(`done`)
}

main()
