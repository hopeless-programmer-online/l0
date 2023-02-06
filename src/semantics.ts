import { Name, MainProgram as Main, DeclarationCommand as Declaration, CallCommand as Call, Program, ReferenceTarget, Command } from './syntax'
import { neverThrow } from './utilities'

// export class Entry {
// }

export abstract class GenericStub {
}

// export class TerminalStub extends GenericStub {
//     public static readonly symbol : unique symbol = Symbol(`l0.syntax.TerminalStub`)

//     public readonly symbol : typeof TerminalStub.symbol = TerminalStub.symbol
// }

// export class BindStub extends GenericStub {
//     public static readonly symbol : unique symbol = Symbol(`l0.syntax.BindStub`)

//     public readonly symbol : typeof BindStub.symbol = BindStub.symbol
// }

export class TemplateStub extends GenericStub {
    public static readonly symbol : unique symbol = Symbol(`l0.syntax.TemplateStub`)

    public readonly symbol : typeof TemplateStub.symbol = TemplateStub.symbol
    public readonly targets : number[]

    public constructor({ targets } : { targets : number[] }) {
        super()

        this.targets = targets
    }
}

// export class NamedStub extends GenericStub {
//     public static readonly symbol : unique symbol = Symbol(`l0.syntax.NamedStub`)

//     public readonly symbol : typeof NamedStub.symbol = NamedStub.symbol
//     public readonly name : Name

//     public constructor({ name } : { name : Name }) {
//         super()

//         this.name = name
//     }
// }

// export type Stub = TerminalStub | BindStub | TemplateStub | NamedStub

class CurrentInstructionPlaceholder {
    public static readonly symbol : unique symbol = Symbol(`l0.syntax.CurrentInstructionPlaceholder`)

    public readonly symbol : typeof CurrentInstructionPlaceholder.symbol = CurrentInstructionPlaceholder.symbol
}

class BindPlaceholder {
    public static readonly symbol : unique symbol = Symbol(`l0.syntax.BindPlaceholder`)

    public readonly symbol : typeof BindPlaceholder.symbol = BindPlaceholder.symbol
}

class LoopTemplatePlaceholder {
    public static readonly symbol : unique symbol = Symbol(`l0.syntax.LoopTemplatePlaceholder`)

    public readonly symbol : typeof LoopTemplatePlaceholder.symbol = LoopTemplatePlaceholder.symbol
    public readonly program : Program

    public constructor({ program } : { program : Program }) {
        this.program = program
    }
}

abstract class CommandTemplatePlaceholder<Command extends Declaration | Call> {
    public readonly command : Command

    public constructor({ command } : { command : Command }) {
        this.command = command
    }
}

class DeclarationTemplatePlaceholder extends CommandTemplatePlaceholder<Declaration> {
    public static readonly symbol : unique symbol = Symbol(`l0.syntax.DeclarationTemplate`)

    public readonly symbol : typeof DeclarationTemplatePlaceholder.symbol = DeclarationTemplatePlaceholder.symbol
}

class ContinuationBidingTemplatePlaceholder extends CommandTemplatePlaceholder<Call> {
    public static readonly symbol : unique symbol = Symbol(`l0.syntax.ContinuationBidingTemplate`)

    public readonly symbol : typeof ContinuationBidingTemplatePlaceholder.symbol = ContinuationBidingTemplatePlaceholder.symbol
}

class ControlPassingTemplatePlaceholder extends CommandTemplatePlaceholder<Call> {
    public static readonly symbol : unique symbol = Symbol(`l0.syntax.ControlPassingTemplate`)

    public readonly symbol : typeof ControlPassingTemplatePlaceholder.symbol = ControlPassingTemplatePlaceholder.symbol
}

type Placeholder =
    | CurrentInstructionPlaceholder
    | BindPlaceholder
    | LoopTemplatePlaceholder
    | DeclarationTemplatePlaceholder
    | ContinuationBidingTemplatePlaceholder
    | ControlPassingTemplatePlaceholder

type BufferElement = Placeholder | ReferenceTarget

function collectTemplates(program : Program, templates : Placeholder[] = []) {
    for (const command of program.commands) {
        if (command.symbol === Declaration.symbol) {
            templates.push(new DeclarationTemplatePlaceholder({ command }))

            collectTemplates(command.program)
        }
        else if (command.symbol === Call.symbol) {
            templates.push(new ContinuationBidingTemplatePlaceholder({ command }))
            templates.push(new ControlPassingTemplatePlaceholder({ command }))
        }
        else neverThrow(command, new Error(`Unexpected command: ${command}.`))
    }

    templates.push(new LoopTemplatePlaceholder({ program }))

    return templates
}
function findBind(state : BufferElement[]) {
    return findPlaceholderIndex(state, x => x.symbol === BindPlaceholder.symbol)
}
function findPlaceholderIndex(state : BufferElement[], callback : (element : BufferElement) => boolean) {
    const index = state.findIndex(callback)

    if (index < 0) throw new Error(`Cannot locate element in the buffer.`)

    return index
}
function findContinuationIndex(state : BufferElement[], command : Command) {
    const { next } = command
    // template of the next command or loop as continuation template
    const continuationIndex =
        next === null                      ? findPlaceholderIndex(state, x => x.symbol === LoopTemplatePlaceholder.symbol && x.program === command.commands.program) :
        next.symbol === Declaration.symbol ? findPlaceholderIndex(state, x => x.symbol === DeclarationTemplatePlaceholder.symbol && x.command === next) :
        next.symbol === Call.symbol        ? findPlaceholderIndex(state, x => x.symbol === ContinuationBidingTemplatePlaceholder.symbol && x.command === next) :
        neverThrow(next, new Error(`Unexpected next command ${next}.`))

    return continuationIndex
}

export class Analyzer {
    public analyze(main : Main) {
        const templates = collectTemplates(main)

        function processCommands(program : Program, state : BufferElement[]) {
            state = [ ...state, ...program.parameters ]

            for (const command of program.commands) {
                const continuationIndex = findContinuationIndex(state, command)

                if (command.symbol === Declaration.symbol) {
                    new TemplateStub({ targets : [
                        // call binding program
                        findBind(state),
                        // pass template for the next command
                        continuationIndex,
                        // pass template of the target program
                        findPlaceholderIndex(state, x => x.symbol === DeclarationTemplatePlaceholder.symbol && x.command === command),
                        // pass all elements in the buffer
                        ...state.map((x, i) => i),
                    ] })

                    state.push(command.program)
                }
                else if (command.symbol === Call.symbol) {
                    new TemplateStub({ targets : [
                        // call binding program
                        findBind(state),
                        // pass template for the next command
                        continuationIndex,
                        // pass template of the call continuation
                        findPlaceholderIndex(state, x => x.symbol === ContinuationBidingTemplatePlaceholder.symbol && x.command === command),
                        // pass all elements in the buffer
                        ...state.map((x, i) => i),
                    ] })
                    new TemplateStub({ targets : [
                        // call binding program
                        findPlaceholderIndex(state, x => x.symbol === ControlPassingTemplatePlaceholder.symbol && x.command === command),
                        // pass continuation that is at the end of the buffer
                        state.length,
                        // pass inputs
                        ...command.inputs.map(x => findPlaceholderIndex(state, y => y === x.reference.target))
                    ] })

                    state.push(...command.outputs)
                }
                else neverThrow(command, new Error(`Unexpected command z: ${command}.`))
            }
        }

        processCommands(main, [ ...templates, new BindPlaceholder ])
    }
}
