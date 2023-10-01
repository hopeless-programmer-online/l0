import * as syntax from './syntax'
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
class ContinuationBidingPlaceholder {
    public static readonly symbol : unique symbol = Symbol(`l0.syntax.ContinuationBidingPlaceholder`)

    public readonly symbol : typeof ContinuationBidingPlaceholder.symbol = ContinuationBidingPlaceholder.symbol
    public readonly command : Call

    public constructor({ command } : { command : Call }) {
        this.command = command
    }
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
    | ContinuationBidingPlaceholder

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
    const { first } = program.commands

    if (!first) return findPlaceholderIndex(state, x => x.symbol === LoopTemplatePlaceholder.symbol && x.program === program)

    return findPlaceholderIndex(state, x => (x.symbol === DeclarationTemplatePlaceholder.symbol || x.symbol === ContinuationBidingTemplatePlaceholder.symbol) && x.command === first)
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
function fillTemplates(
    program : Program, state : BufferElement[],
    templatePlaceholders : TemplatePlaceholder[],
    used : Map<Command, BufferSet>,
    statistics? : {
        bind : {
            total : number
            filtered : number
        }
    },
    lookup : Map<TemplatePlaceholder, Template> = new Map
) {
    if (!statistics) statistics = {
        bind : {
            total : 0,
            filtered : 0,
        },
    }

    state = [ ...state, ...program.parameters ]

    function printState(state : BufferElement[]) {
        console.log(`---------------------------------`)

        for (const x of state) {
            if (x.symbol === CurrentInstructionPlaceholder.symbol) {
                console.log(`[current instruction]`)
            }
            else if (x.symbol === BindPlaceholder.symbol) {
                console.log(`[external] bind`)
            }
            else if (x.symbol === LoopTemplatePlaceholder.symbol) {
                console.log(`[template] loop ${x.program.symbol === Main.symbol ? `main` : x.program.declaration.name}`)
            }
            else if (x.symbol === DeclarationTemplatePlaceholder.symbol) {
                console.log(`[template] declaration ${x.command.name}`)
            }
            else if (x.symbol === ContinuationBidingTemplatePlaceholder.symbol) {
                console.log(`[template] continuation biding ${x.command.target.name}()`)
            }
            else if (x.symbol === ControlPassingTemplatePlaceholder.symbol) {
                console.log(`[template] control passing ${x.command.target.name}()`)
            }
            else if (x.symbol === ContinuationBidingPlaceholder.symbol) {
                console.log(`[internal] continuation biding ${x.command.target.name}`)
            }
            else if (x.symbol === syntax.MainProgram.symbol) {
                console.log(`[internal] main`)
            }
            else if (x.symbol === syntax.DeclaredProgram.symbol) {
                console.log(`[internal] ${x.declaration.name} program`)
            }
            else if (x.symbol === syntax.ExplicitParameter.symbol || x.symbol === syntax.SuperParameter.symbol) {
                console.log(`[internal] ${x.name} parameter`)
            }
            else if (x.symbol === syntax.ExplicitOutput.symbol || x.symbol === syntax.SubOutput.symbol) {
                console.log(`[internal] ${x.name} output ${x.outputs.call.target.name}()`)
            }
        }
    }

    for (const command of program.commands) {
        // console.log(`processing ${command}`)

        const continuationIndex = findContinuationIndex(state, command)

        const usedByCommand = used.get(command)

        if (!usedByCommand) throw new Error // @todo

        if (command.symbol === Declaration.symbol) {
            const stored = state
                .map((target, index) => ({ target, index }))
                .slice(1)
                .filter(x => usedByCommand.has(x.target))

            statistics.bind.total += state.length - 1
            statistics.bind.filtered += stored.length

            lookup.set(
                findPlaceholder(templatePlaceholders, x => x.symbol === DeclarationTemplatePlaceholder.symbol && x.command === command),
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
                        // pass all elements in the buffer, except current command
                        ...stored.map(x => x.index),
                    ],
                }),
            )

            state = [
                new CurrentInstructionPlaceholder,
                ...stored.map(x => x.target),
                command.program,
            ]

            fillTemplates(command.program, state, templatePlaceholders, used, statistics, lookup)
        }
        else if (command.symbol === Call.symbol) {
            const stored = state
                .map((target, index) => ({ target, index }))
                .slice(1)
                .filter(x => usedByCommand.has(x.target))

            statistics.bind.total += state.length - 1
            statistics.bind.filtered += stored.length

            lookup.set(
                findPlaceholder(templatePlaceholders, x => x.symbol === ContinuationBidingTemplatePlaceholder.symbol && x.command === command),
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
                        // pass all elements in the buffer, except current command
                        ...stored.map(x => x.index),
                    ],
                }),
            )

            state = [
                new CurrentInstructionPlaceholder,
                ...stored.map(x => x.target),
                new ContinuationBidingPlaceholder({ command }),
            ]

            lookup.set(
                findPlaceholder(templatePlaceholders, x => x.symbol === ControlPassingTemplatePlaceholder.symbol && x.command === command),
                new Template({
                    source : command,
                    comment : `Control passing for ${command.target.name} call.`,
                    targets : [
                        // call target program
                        findPlaceholderIndex(state, x => x === command.target.target),
                        // pass continuation
                        findPlaceholderIndex(state, x => x.symbol === ContinuationBidingPlaceholder.symbol && x.command === command),
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
        findPlaceholder(templatePlaceholders, x => x.symbol === LoopTemplatePlaceholder.symbol && x.program === program),
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

    return { lookup, statistics }
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
function find<T>(collection : T[], callback : (element : T) => boolean) {
    for (const element of collection) if (callback(element)) return element

    throw new Error(`Cannot find element.`)
}
function optimizePlaceholders(program : Program, placeholders : Placeholder[], lookup? : Map<Command, BufferSet>) {
    if (!lookup) lookup = new Map

    const { commands } = program

    const used = new BufferSet()

    const bind = find(placeholders, x => x.symbol === BindPlaceholder.symbol)

    // add bind
    used.add(bind)

    const loop = find(placeholders, x => x.symbol === LoopTemplatePlaceholder.symbol && x.program === program)

    // add program loop template
    used.add(loop)

    // add super
    used.add(program.parameters.super)

    for (let command = commands.last; command; command = command.previous) {
        if (command.symbol === Declaration.symbol) {
            const { program } = command

            const [ usedByProgram ] = optimizePlaceholders(program, placeholders, lookup)

            for (const x of usedByProgram) used.add(x)

            const bind = find(placeholders, x => x.symbol === BindPlaceholder.symbol)

            // add bind
            used.add(bind)

            const { first } = program.commands

            const entry =
                !first ? find(placeholders, x => x.symbol === LoopTemplatePlaceholder.symbol && x.program === program) :
                first.symbol === Declaration.symbol ? find(placeholders, x => x.symbol === DeclarationTemplatePlaceholder.symbol && x.command === first) :
                first.symbol === Call.symbol ? find(placeholders, x => x.symbol === ContinuationBidingTemplatePlaceholder.symbol && x.command === first) :
                neverThrow(first, new Error(`Unexpected command ${first}.`))

            // add template for first command of declared program
            used.add(entry)
        }
        else if (command.symbol === Call.symbol) {
            const bind = find(placeholders, x => x.symbol === BindPlaceholder.symbol)

            // add bind
            used.add(bind)

            // add target
            used.add(command.target.target)

            // add inputs
            for (const input of command.inputs) used.add(input.reference.target)

            const continuationTemplate = find(placeholders, x => x.symbol === ContinuationBidingTemplatePlaceholder.symbol && x.command === command)

            // add continuation template
            used.add(continuationTemplate)

            const passingTemplate = find(placeholders, x => x.symbol === ControlPassingTemplatePlaceholder.symbol && x.command === command)

            // add control passing template
            used.add(passingTemplate)

            const continuation = new ContinuationBidingPlaceholder({ command })

            // add continuation placeholder
            used.add(continuation)

            // @todo
        }
        else neverThrow(command, new Error(`Unexpected command: ${command}.`))

        const { next } = command

        if (next) {
            const entry =
                next.symbol === Declaration.symbol ? find(placeholders, x => x.symbol === DeclarationTemplatePlaceholder.symbol && x.command === next) :
                next.symbol === Call.symbol ? find(placeholders, x => x.symbol === ContinuationBidingTemplatePlaceholder.symbol && x.command === next) :
                neverThrow(next, new Error(`Unexpected command ${next}.`))

            // add continuation
            used.add(entry)
        }

        lookup.set(command, new BufferSet(used))
    }

    return [ used, lookup ] as const
}

export class Analyzer {
    public analyze(main : Main) {
        const templatePlaceholders = collectTemplates(main)
        const placeholders = [ new CurrentInstructionPlaceholder, ...templatePlaceholders, new BindPlaceholder ]
        const used = optimizePlaceholders(main, placeholders)[1]
        const { lookup, statistics } = fillTemplates(main, placeholders, templatePlaceholders, used)

        console.log(`${statistics.bind.filtered} / ${statistics.bind.total} filtered ${(statistics.bind.filtered / statistics.bind.total * 100).toFixed()}%`)

        const templates = templatePlaceholders.map(placeholder => {
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

function is_equal(a : BufferElement, b : BufferElement) {
    if (a.symbol === ContinuationBidingPlaceholder.symbol) {
        return b.symbol === ContinuationBidingPlaceholder.symbol && a.command === b.command
    }

    return a === b
}

class BufferSet {
    private list : BufferElement[]

    public constructor(list? : BufferElement[] | BufferSet) {
        if (!list) list = []
        else if (list instanceof BufferSet) list = list.list

        this.list = list
    }

    public * [Symbol.iterator]() {
        yield * this.list
    }

    public add(x : BufferElement) {
        if (this.list.find(y => is_equal(x, y))) return

        this.list.push(x)
    }
    public has(x : BufferElement) {
        return this.list.find(y => is_equal(x, y)) !== undefined
    }
}
