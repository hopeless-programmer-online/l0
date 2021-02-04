import { Command, Declaration, Execution, Program, ReferenceTarget } from '../front'
import Template from './template'

export default function translate(program : Program) {
    const globals : BufferTargets = [
        new BindProgram,
        new CallProgram,
        new TailProgram,
    ]

    function collect(program : Program) {
        for (const command of program.commands) {
            globals.push(new CommandTemplate({ command }))

            if (command instanceof Declaration) collect(command.program)
        }
    }

    collect(program)

    const lookup = new Map<Command, Template>()

    function transform(program : Program, buffer : BufferTargets) {
        function transformCommands(commands : Command[], buffer : BufferTargets) {
            function findFirst(program : Program) {
                const { commands } = program

                if (commands.empty) {
                    const index = buffer.findIndex(x => x instanceof TailProgram)

                    if (index < 0) throw new Error // @todo

                    return index
                }

                const command = commands.first
                const index = buffer.findIndex(x => x instanceof CommandTemplate && x.command === command)

                if (index < 0) throw new Error // @todo

                return index
            }

            if (commands.length <= 0) {
                const tail = buffer.findIndex(x => x instanceof TailProgram)

                if (tail < 0) throw new Error // @todo

                return tail
            }

            const command = commands[0]

            if (command instanceof Declaration) {
                // @todo: transform program

                const bind = buffer.findIndex(x => x instanceof BindProgram)

                if (bind < 0) throw new Error // @todo

                const template = findFirst(command.program)

                const next = transformCommands(commands.slice(1), [ ...buffer, command ])
                const instruction = new Template({ targets : [
                    bind,
                    next,
                    template,
                    // @todo
                ] })

                if (lookup.has(command)) throw new Error // @todo

                lookup.set(command, instruction)
            }
            else if (command instanceof Execution) {
                const call = buffer.findIndex(x => x instanceof BindProgram)

                if (call < 0) throw new Error // @todo

                const target = buffer.findIndex(x => x === command.target.target)

                if (target < 0) throw new Error // @todo

                const next = transformCommands(commands.slice(1), [...buffer, ...command.outputs ])
                const instruction = new Template({ targets : [
                    call,
                    next,
                    target,
                    // @todo
                ] })

                if (lookup.has(command)) throw new Error // @todo

                lookup.set(command, instruction)
            }
            else {
                throw new Error // @todo
            }

            const self = buffer.findIndex(x => x instanceof CommandTemplate && x.command === command)

            if (self < 0) throw new Error // @todo

            return self
        }

        transformCommands([ ...program.commands ], [ ...buffer, ...program.parameters ])
    }

    transform(program, [ ...globals ])

    // const entry = program.commands.empty
    //     ? lookup.get(program.commands.first)
    //     :
    new Template({ targets :  })
}

class Placeholder {}
class BindProgram extends Placeholder {}
class CallProgram extends Placeholder {}
class TailProgram extends Placeholder {}
class CommandTemplate extends Placeholder {
    public readonly command : Command

    public constructor({ command } : { command : Command }) {
        super()

        this.command = command
    }
}

type BufferTarget = Placeholder | ReferenceTarget
type BufferTargets = BufferTarget[]
