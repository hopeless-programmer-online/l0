import { Command, Declaration, Execution, Program, ReferenceTarget } from './front'
import InternalInstruction from './back/internal-instruction'
import Template from './back/template'
import TerminalInstruction from './back/terminal-instruction'
import BindInstruction from './back/bind-instruction'

export default function translate(program : Program) {
    const internals : Placeholder[] = [
        new BindProgram,
    ]

    function collect(program : Program) {
        internals.push(new ProgramLoopTemplate({ program }))

        for (const command of program.commands) {
            if (command instanceof Declaration) {
                internals.push(new DeclarationBindingTemplate({ command }))

                collect(command.program)
            }
            else if (command instanceof Execution) {
                internals.push(
                    new ExecutionContinuationBindingTemplate({ command }),
                    new ExecutionControlPassingTemplate({ command }),
                )
            }
            else {
                throw new Error // @todo
            }
        }
    }

    collect(program)

    const lookup = new Map<TemplatePlaceholder, Template>()

    function findEntry(program : Program, targets : BufferTargets) {
        const { commands } = program

        if (commands.empty) {
            const loop = targets.find(x => x instanceof ProgramLoopTemplate && x.program === program)

            if (!loop) throw new Error // todo

            return loop
        }

        const { first } = commands

        if (first instanceof Declaration) {
            const binding = targets.find(x => x instanceof DeclarationBindingTemplate && x.command === first)

            if (!binding) throw new Error // todo

            return binding
        }
        else if (first instanceof Execution) {
            const binding = targets.find(x => x instanceof ExecutionContinuationBindingTemplate && x.command === first)

            if (!binding) throw new Error // todo

            return binding
        }
        else {
            throw new Error // @todo
        }
    }
    function findEntryIndex(program : Program, targets : BufferTargets) {
        const target = findEntry(program, targets)
        const index = targets.indexOf(target)

        if (index < 0) throw new Error // todo

        return index
    }
    function transform(program : Program, targets : BufferTargets) {
        function transformCommands(commands : Command[], targets : BufferTargets) {
            if (commands.length <= 0) {
                const selfIndex = 0
                const superIndex = targets.indexOf(program.parameters.super)

                if (superIndex < 0) throw new Error // @todo

                const template = new Template({
                    comment : `Super caller`,
                    targets : [
                        superIndex + 1, // add 1 to compensate absence of "self" in targets
                        selfIndex, // no need to compensate self
                    ],
                })
                const placeholder = internals.find(x => x instanceof ProgramLoopTemplate && x.program === program)

                if (!placeholder) throw new Error // @todo
                if (lookup.has(placeholder)) throw new Error // @todo

                lookup.set(placeholder, template)

                return placeholder
            }

            const command = commands[0]

            if (command instanceof Declaration) {
                transform(command.program, [ ...targets, command, ...command.program.parameters ])

                const bind = targets.findIndex(x => x instanceof BindProgram)

                if (bind < 0) throw new Error // @todo

                const target = findEntryIndex(command.program, targets)
                const then = transformCommands(commands.slice(1), [ ...targets, command ])

                const thenIndex = targets.findIndex(x => x === then)

                if (thenIndex < 0) throw new Error // @todo

                const template = new Template({
                    comment : `${command.name.text} declaration`,
                    targets : [
                        // pass control to bind program
                        bind + 1, // add 1 to compensate absence of "self" in targets
                        // pass index of next command template as continuation
                        thenIndex + 1, // add 1 to compensate absence of "self" in targets
                        // pass index of target program template
                        target + 1, // add 1 to compensate absence of "self" in targets
                        // pass rest of the parameters
                        ...targets.map((_, i) => i + 1), // add 1 to compensate absence of "self" in targets
                    ],
                })

                const placeholder = internals.find(x => x instanceof DeclarationBindingTemplate && x.command === command)

                if (!placeholder) throw new Error // @todo
                if (lookup.has(placeholder)) throw new Error // @todo

                lookup.set(placeholder, template)

                return placeholder
            }
            else if (command instanceof Execution) {
                const bind = targets.findIndex(x => x instanceof BindProgram)

                if (bind < 0) throw new Error // @todo

                const then = targets.findIndex(x => x instanceof ExecutionControlPassingTemplate && x.command === command)

                if (then < 0) throw new Error // @todo

                const continuation = transformCommands(commands.slice(1), [
                    // variables binded from current buffer
                    ...targets,
                    // continuation for passing control to target program
                    new ContinuationInstructionPlaceholder,
                    // execution outputs
                    ...command.outputs,
                ])

                const continuationIndex = targets.findIndex(x => x === continuation)

                if (continuationIndex < 0) throw new Error // @todo

                const continuationBindingTemplate = new Template({
                    comment : `Continuation binding for ${command.target.name.text}`,
                    targets : [
                        // pass control to bind program
                        bind + 1, // add 1 to compensate absence of "self" in targets
                        // pass index of control passing template which will accept binded continuation as parameter
                        then + 1, // add 1 to compensate absence of "self" in targets
                        // pass index of the next command template to execute
                        continuationIndex + 1, // add 1 to compensate absence of "self" in targets
                        // pass rest of the parameters
                        ...targets.map((_, i) => i + 1), // add 1 to compensate absence of "self" in targets
                    ],
                })

                const continuationBindingPlaceholder = internals.find(x => x instanceof ExecutionContinuationBindingTemplate && x.command === command)

                if (!continuationBindingPlaceholder) throw new Error // @todo
                if (lookup.has(continuationBindingPlaceholder)) throw new Error // @todo

                lookup.set(continuationBindingPlaceholder, continuationBindingTemplate)

                const target = targets.findIndex(x => x === command.target.target)

                if (target < 0) throw new Error // @todo

                const controlPassTemplate = new Template({
                    comment : `Control passing to ${command.target.name.text}`,
                    targets : [
                        // pass control to target
                        target + 1, // add 1 to compensate absence of "self" in targets
                        // pass index of continuation which will be on top of the buffer after binding as super
                        targets.length + 1, // add 1 to compensate absence of "self" in targets
                        // pass execution inputs
                        ...[ ...command.inputs ].map(({ target }) => {
                            const index = targets.indexOf(target)

                            if (index < 0) throw new Error // @todo

                            return index + 1 // add 1 to compensate absence of "self" in targets
                        }),
                    ],
                })

                const controlPassPlaceholder = internals.find(x => x instanceof ExecutionControlPassingTemplate && x.command === command)

                if (!controlPassPlaceholder) throw new Error // @todo
                if (lookup.has(controlPassPlaceholder)) throw new Error // @todo

                lookup.set(controlPassPlaceholder, controlPassTemplate)

                return continuationBindingPlaceholder
            }

            throw new Error // @todo
        }

        transformCommands([ ...program.commands ], [ ...targets, ...program.parameters ])
    }

    transform(program, [ ...internals ])

    const entry = findEntry(program, internals)
    const entryTemplate = lookup.get(entry)

    if (!entryTemplate) throw new Error // @todo

    const bind = new BindInstruction

    return new InternalInstruction({
        template : entryTemplate,
        buffer : [
            ...internals.map(x => {
                if (x instanceof BindProgram) return bind
                if (!(x instanceof TemplatePlaceholder)) throw new Error // @todo

                const template = lookup.get(x)

                if (!template) throw new Error // @todo

                return template
            }),
            new TerminalInstruction,
        ],
    })
}

class Placeholder {}
class BindProgram extends Placeholder {}
class ContinuationInstructionPlaceholder extends Placeholder {}
class TemplatePlaceholder extends Placeholder {}
class ProgramLoopTemplate extends TemplatePlaceholder {
    public readonly program : Program

    public constructor({ program } : { program : Program }) {
        super()

        this.program = program
    }
}
class DeclarationBindingTemplate extends TemplatePlaceholder {
    public readonly command : Declaration

    public constructor({ command } : { command : Declaration }) {
        super()

        this.command = command
    }
}
class ExecutionContinuationBindingTemplate extends TemplatePlaceholder {
    public readonly command : Execution

    public constructor({ command } : { command : Execution }) {
        super()

        this.command = command
    }
}
class ExecutionControlPassingTemplate extends TemplatePlaceholder {
    public readonly command : Execution

    public constructor({ command } : { command : Execution }) {
        super()

        this.command = command
    }
}

type BufferTarget = Placeholder | ReferenceTarget
type BufferTargets = BufferTarget[]
