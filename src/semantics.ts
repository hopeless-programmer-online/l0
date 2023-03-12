import { formatWithOptions } from 'util'
import { Name, MainProgram as Main, DeclarationCommand as Declaration, CallCommand as Call, Program, ReferenceTarget, Command, SuperParameter, ExplicitParameter } from './syntax'
import { neverThrow } from './utilities'

export class Entry {
    public readonly dependencies : Value[]
    public readonly entryTemplate : Template

    public constructor({
        dependencies,
        entryTemplate,
    } : {
        dependencies : Value[]
        entryTemplate : Template
    }) {
        this.dependencies = dependencies
        this.entryTemplate = entryTemplate
    }
}

export abstract class GenericValue {
}

export class Terminal extends GenericValue {
    public static readonly symbol : unique symbol = Symbol(`l0.syntax.TerminalValue`)

    public readonly symbol : typeof Terminal.symbol = Terminal.symbol
}

export class Bind extends GenericValue {
    public static readonly symbol : unique symbol = Symbol(`l0.syntax.BindProgramValue`)

    public readonly symbol : typeof Bind.symbol = Bind.symbol
}

export class Template extends GenericValue {
    public static readonly symbol : unique symbol = Symbol(`l0.syntax.Template`)

    public readonly symbol : typeof Template.symbol = Template.symbol
    public readonly source : Program | Command
    public readonly comment : string
    public readonly targets : number[]

    public constructor({
        source,
        comment,
        targets,
    } : {
        source : Program | Command
        comment : string
        targets : number[]
    }) {
        super()

        this.source = source
        this.comment = comment
        this.targets = targets
    }
}

export class Named extends GenericValue {
    public static readonly symbol : unique symbol = Symbol(`l0.syntax.NamedValue`)

    public readonly symbol : typeof Named.symbol = Named.symbol
    public readonly name : Name

    public constructor({ name } : { name : Name }) {
        super()

        this.name = name
    }
}

export type Value = Bind | Template | Named | Terminal

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

type TemplatePlaceholder =
    | LoopTemplatePlaceholder
    | DeclarationTemplatePlaceholder
    | ContinuationBidingTemplatePlaceholder
    | ControlPassingTemplatePlaceholder
type Placeholder =
    | CurrentInstructionPlaceholder
    | BindPlaceholder
    | TemplatePlaceholder

type BufferElement = Placeholder | ReferenceTarget

function collectTemplates(program : Program, templates : TemplatePlaceholder[] = []) {
    for (const command of program.commands) {
        if (command.symbol === Declaration.symbol) {
            templates.push(new DeclarationTemplatePlaceholder({ command }))

            collectTemplates(command.program, templates)
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
function findHeadIndex(state : BufferElement[], program : Program) {
    const { last } = program.commands

    if (!last) return findPlaceholderIndex(state, x => x.symbol === LoopTemplatePlaceholder.symbol && x.program === program)

    return findPlaceholderIndex(state, x => (x.symbol === DeclarationTemplatePlaceholder.symbol || x.symbol === ContinuationBidingTemplatePlaceholder.symbol) && x.command === last)
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
function findPlaceholder(placeholders : TemplatePlaceholder[], callback : (placeholder : TemplatePlaceholder) => boolean) {
    const placeholder = placeholders.find(callback)

    if (!placeholder) throw new Error(`Cannot find placeholder.`)

    return placeholder
}
function fillTemplates(program : Program, state : BufferElement[], placeholders : TemplatePlaceholder[], lookup : Map<TemplatePlaceholder, Template> = new Map) {
    state = [ ...state, ...program.parameters ]

    for (const command of program.commands) {
        const continuationIndex = findContinuationIndex(state, command)

        if (command.symbol === Declaration.symbol) {
            lookup.set(
                findPlaceholder(placeholders, x => x.symbol === DeclarationTemplatePlaceholder.symbol && x.command === command),
                new Template({
                    source : command,
                    comment : `Declaration of ${command.name} program.`,
                    targets : [
                        // call binding program
                        findBind(state),
                        // pass template for the next command
                        continuationIndex,
                        // pass template of the target program
                        findHeadIndex(state, command.program),
                        // pass all elements (except current command) in the buffer
                        ...state.slice(1).map((x, i) => i + 1),
                        // // pass all elements in the buffer
                        // ...state.map((x, i) => i),
                    ],
                }),
            )

            state.push(command.program)

            fillTemplates(command.program, state, placeholders, lookup)
        }
        else if (command.symbol === Call.symbol) {
            lookup.set(
                findPlaceholder(placeholders, x => x.symbol === ContinuationBidingTemplatePlaceholder.symbol && x.command === command),
                new Template({
                    source : command,
                    comment : `Continuation binding for ${command.target.name} call.`,
                    targets : [
                        // call binding program
                        findBind(state),
                        // pass control passing template
                        findPlaceholderIndex(state, x => x.symbol === ControlPassingTemplatePlaceholder.symbol && x.command === command),
                        // pass template for the next command
                        continuationIndex,
                        // pass all elements (except current command) in the buffer
                        ...state.slice(1).map((x, i) => i + 1),
                    ],
                }),
            )
            lookup.set(
                findPlaceholder(placeholders, x => x.symbol === ControlPassingTemplatePlaceholder.symbol && x.command === command),
                new Template({
                    source : command,
                    comment : `Control passing for ${command.target.name} call.`,
                    targets : [
                        // call target program
                        findPlaceholderIndex(state, x => x === command.target.target),
                        // pass continuation that is at the end of the buffer
                        state.length,
                        // pass inputs
                        ...command.inputs.map(x => findPlaceholderIndex(state, y => y === x.reference.target)),
                    ],
                }),
            )

            state.push(...command.outputs)
        }
        else neverThrow(command, new Error(`Unexpected command: ${command}.`))
    }

    lookup.set(
        findPlaceholder(placeholders, x => x.symbol === LoopTemplatePlaceholder.symbol && x.program === program),
        new Template({
            source : program,
            comment : `Loop for ${program.symbol === Main.symbol ? `main` : program.declaration.name} program.`,
            targets : [
                // call super program
                findPlaceholderIndex(state, x => x === program.parameters.super),
                // pass super as super
                findPlaceholderIndex(state, x => x === program.parameters.super),
            ],
        }),
    )

    return lookup
}
function findEntryTemplate(main : Main, lookup : Map<TemplatePlaceholder, Template>) {
    const entries = Array.from(lookup)
    const { first } = main.commands

    const predicate : ([] : [ TemplatePlaceholder, Template ]) => boolean =
        !first ? ([ k ]) => k.symbol === LoopTemplatePlaceholder.symbol && k.program === main :
        first.symbol === Declaration.symbol ? ([ k ]) => k.symbol === DeclarationTemplatePlaceholder.symbol && k.command === first :
        first.symbol === Call.symbol ? ([ k ]) => k.symbol === ContinuationBidingTemplatePlaceholder.symbol && k.command === first :
        neverThrow(first, new Error(`Unexpected command ${first}.`))

    const entry = entries.find(predicate)

    if (!entry) throw new Error(`Can't find main entry template.`)

    return entry[1]
}

export class Analyzer {
    public analyze(main : Main) {
        const placeholders = collectTemplates(main)
        const lookup = fillTemplates(main, [ new CurrentInstructionPlaceholder, ...placeholders, new BindPlaceholder ], placeholders)
        const templates = placeholders.map(placeholder => {
            const template = lookup.get(placeholder)

            if (!template) {
                console.error(placeholder)

                throw new Error(`Placeholder ${placeholder} is not filled.`)
            }

            return template
        })
        const entryTemplate = findEntryTemplate(main, lookup)
        const dependencies = [
            ...templates,
            new Bind,
            ...main.parameters.map(parameter =>
                parameter.symbol === SuperParameter.symbol ? new Terminal :
                parameter.symbol === ExplicitParameter.symbol ? new Named({ name : parameter.name }) :
                neverThrow(parameter, new Error(`Unexpected parameter: ${parameter}`))
            )
        ]

        return new Entry({ dependencies, entryTemplate })
    }
}
