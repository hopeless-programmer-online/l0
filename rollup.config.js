import typescript from '@rollup/plugin-typescript'
import dts from 'rollup-plugin-dts'
import shebang from 'rollup-plugin-preserve-shebang'

export default [
    {
        input: 'src/l0.ts',
        output: {
            file: 'dist/l0.js',
            format: 'cjs',
        },
        plugins: [ typescript() ],
    },
    {
        input: '.ts/cli.js',
        output: {
            file: 'dist/cli.js',
            format: 'cjs',
        },
        plugins: [ shebang() ],
    },
    {
        input: '.ts/l0.d.ts',
        output: {
            file: 'dist/l0.d.ts',
            format: 'es',
        },
        plugins: [ dts() ],
    },
]
