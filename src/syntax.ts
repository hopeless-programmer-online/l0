import * as lexis from './lexis'
import { neverThrow } from './utilities'

export type Text = string

export abstract class GenericWord {
    public static from(word : lexis.BareWord | lexis.QuotedWord) {
        if (word.symbol === lexis.BareWord.symbol) return BareWord.from(word)
        if (word.symbol === lexis.QuotedWord.symbol) return QuotedWord.from(word)

        neverThrow(word, new Error(`Unexpected word ${word}.`))
    }

    public readonly text : Text

    public constructor({ text } : { text : Text }) {
        this.text = text
    }

    public abstract isEqual(other : Word) : boolean

    public toString() {
        return this.text
    }
}

export class BareWord extends GenericWord {
    public static readonly symbol : unique symbol = Symbol(`l0.syntax.BareWord`)

    public static from(word : lexis.BareWord) {
        return new BareWord(word)
    }

    public readonly symbol : typeof BareWord.symbol = BareWord.symbol

    public isEqual(other : Word) {
        return other.symbol === BareWord.symbol && this.text === other.text
    }
}

export class QuotedWord extends GenericWord {
    public static readonly symbol : unique symbol = Symbol(`l0.syntax.QuotedWord`)

    public static from(word : lexis.QuotedWord) {
        return new QuotedWord(word)
    }

    public readonly symbol : typeof QuotedWord.symbol = QuotedWord.symbol

    public isEqual(other : Word) {
        return other.symbol === QuotedWord.symbol && this.text === other.text
    }
}

export type Word = BareWord | QuotedWord

export class Name {
    public static from(name : lexis.Name) {
        return new Name({ words : name.words.map(GenericWord.from) })
    }
    public static bare(text : Text) {
        return new Name({ words : [ new BareWord({ text }) ] })
    }

    public readonly words : Word[]

    public constructor({ words } : { words : Word[] }) {
        this.words = words
    }

    public get overlapped() {
        const words = this.words.slice()
        const first = words[0]

        if (first.symbol === BareWord.symbol) words[0] = new BareWord({ text : `/` + first.text })
        else words.unshift(new BareWord({ text : `/` }))

        return new Name({ words })
    }

    public isEqual(other : Name) {
        return (
            this.words.length === other.words.length &&
            this.words.every((word, index) => word.isEqual(other.words[index]))
        )
    }
    public toString() {
        return this.words.map(word => word.toString()).join(` `)
    }
}

type ScopeMap = Map<Name, ReferenceTarget>
type ScopeTarget = Program | Commands | Command | Parameters | Parameter | Outputs | Output

export class Scope {
    public static from(target : ScopeTarget) {
        const map : ScopeMap = new Map

        function insert(name : Name, target : ReferenceTarget) {
            while (Array.from(map.keys()).some(key => name.isEqual(key))) name = name.overlapped

            map.set(name, target)
        }

        while (true) {
            if (target.symbol === MainProgram.symbol) {
                break
            }
            else if (target.symbol === DeclaredProgram.symbol) {
                target = target.declaration
            }
            else if (target.symbol === Commands.symbol) {
                target = target.last || target.program.parameters
            }
            else if (target.symbol === DeclarationCommand.symbol) {
                insert(target.name, target.program)

                target = target.previous || target.commands.program.parameters
            }
            else if (target.symbol === CallCommand.symbol) {
                target = target.outputs
            }
            else if (target.symbol === Parameters.symbol) {
                target = target.last
            }
            else if (target.symbol === SuperParameter.symbol || target.symbol === ExplicitParameter.symbol) {
                insert(target.name, target)

                target = target.previous || target.parameters.program
            }
            else if (target.symbol === Outputs.symbol) {
                target = target.last
            }
            else if (target.symbol === SubOutput.symbol || target.symbol === ExplicitOutput.symbol) {
                insert(target.name, target)

                target = target.previous || target.outputs.call.previous || target.outputs.call.commands.program.parameters
            }
            else neverThrow(target, new Error(`Unexpected target ${target}.`))
        }

        return new Scope({ map })
    }

    private map : ScopeMap

    public constructor({ map } : { map : ScopeMap }) {
        this.map = map
    }

    public find(name : Name) {
        for (const [ key, target ] of this.map.entries()) if (name.isEqual(key)) return new Reference({ name, target })

        return null
    }
    public toString() {
        return Array.from(this.map.keys())
            .map(name => name.toString())
            .join(`, `)
    }
}

export abstract class GenericProgram {
    public abstract readonly parameters : Parameters
    public abstract readonly commands : Commands

    public toString() {
        const commands = `${this.commands}`
            .replace(/^/g, `    `)
            .replace(/\n/g, `\n    `)

        return `(${this.parameters}) {${commands !== `` ? `\n${commands}\n` : ``}}`
    }
}

export class MainProgram extends GenericProgram {
    public static readonly symbol : unique symbol = Symbol(`l0.syntax.MainProgram`)

    public readonly symbol : typeof MainProgram.symbol = MainProgram.symbol
    public readonly parameters : Parameters
    public readonly commands : Commands

    public constructor() {
        super()

        this.parameters = new Parameters({ program : this })
        this.commands = new Commands({ program : this })
    }
}

export class DeclaredProgram extends GenericProgram {
    public static readonly symbol : unique symbol = Symbol(`l0.syntax.DeclaredProgram`)

    public readonly symbol : typeof DeclaredProgram.symbol = DeclaredProgram.symbol
    public readonly declaration : DeclarationCommand
    public readonly parameters : Parameters
    public readonly commands : Commands

    public constructor({ declaration } : { declaration : DeclarationCommand }) {
        super()

        this.declaration = declaration
        this.parameters = new Parameters({ program : this })
        this.commands = new Commands({ program : this })
    }
}

export type Program = MainProgram | DeclaredProgram

export class Parameters {
    public static readonly symbol : unique symbol = Symbol(`l0.syntax.Parameters`)

    public readonly symbol : typeof Parameters.symbol = Parameters.symbol
    public readonly program : Program
    public readonly super : SuperParameter = new SuperParameter({ parameters : this })
    public readonly explicit : ExplicitParameter[] = []

    public constructor({ program } : { program : Program }) {
        this.program = program
    }

    public get last() {
        const { explicit } = this

        if (explicit.length > 0) return explicit[explicit.length - 1]

        return this.super
    }

    public add(name : Name) {
        const parameter = new ExplicitParameter({ name, parameters : this })

        const { last } = this

        last.next = parameter
        parameter.previous = last

        this.explicit.push(parameter)

        return parameter
    }

    public toString() {
        return this.explicit.map(parameter => parameter.toString()).join(`, `)
    }
}

export abstract class GenericParameter {
    public readonly parameters : Parameters
    public readonly name : Name
    public previous : Parameter | null = null
    public next     : Parameter | null = null

    public constructor({ name, parameters } : { name : Name, parameters : Parameters }) {
        this.parameters = parameters
        this.name = name
    }

    public toString() {
        return this.name.toString()
    }
}

export class SuperParameter extends GenericParameter {
    public static readonly symbol : unique symbol = Symbol(`l0.syntax.SuperParameter`)

    public readonly symbol : typeof SuperParameter.symbol = SuperParameter.symbol

    public constructor({ parameters } : { parameters : Parameters }) {
        super({ name : Name.bare(`super`), parameters })
    }
}

export class ExplicitParameter extends GenericParameter {
    public static readonly symbol : unique symbol = Symbol(`l0.syntax.ExplicitParameter`)

    public readonly symbol : typeof ExplicitParameter.symbol = ExplicitParameter.symbol
}

export type Parameter = SuperParameter | ExplicitParameter

export class Commands {
    public static readonly symbol : unique symbol = Symbol(`l0.syntax.Commands`)

    public readonly symbol : typeof Commands.symbol = Commands.symbol
    public readonly program : Program
    public readonly list : Command[] = []

    public constructor({ program } : { program : Program }) {
        this.program = program
    }

    public * [Symbol.iterator]() {
        yield * this.list
    }

    public get last() {
        const { list } = this

        return list.length > 0 ? list[list.length - 1] : null
    }

    private add(command : Command) {
        const { list, last } = this

        if (last) {
            last.next = command
            command.previous = last
        }

        list.push(command)
    }

    public declare(name : Name) {
        const declaration = new DeclarationCommand({ name, commands : this })

        this.add(declaration)

        return declaration
    }
    public call(target : Reference, inputs : Input[]) {
        const call = new CallCommand({
            target,
            inputs : new Inputs({ list : inputs }),
            commands : this,
        })

        this.add(call)

        return call
    }

    public toString() {
        return this.list.map(command => command.toString()).join(`\n`)
    }
}

export abstract class GenericCommand {
    public readonly commands : Commands
    public previous : Command | null = null
    public next     : Command | null = null

    public constructor({ commands } : { commands : Commands }) {
        this.commands = commands
    }

    public abstract toString() : string
}

export class DeclarationCommand extends GenericCommand {
    public static readonly symbol : unique symbol = Symbol(`l0.syntax.DeclarationCommand`)

    public readonly symbol : typeof DeclarationCommand.symbol = DeclarationCommand.symbol
    public readonly name : Name
    public readonly program : DeclaredProgram

    public constructor({ name, commands } : { name : Name, commands : Commands }) {
        super({ commands })

        this.name = name
        this.program = new DeclaredProgram({ declaration : this })
    }

    public toString() {
        return `${this.name} ${this.program}`
    }
}

export class CallCommand extends GenericCommand {
    public static readonly symbol : unique symbol = Symbol(`l0.syntax.CallCommand`)

    public readonly symbol : typeof CallCommand.symbol = CallCommand.symbol
    public readonly target : Reference
    public readonly inputs : Inputs
    public readonly outputs : Outputs

    public constructor({ target, inputs, commands } : { target : Reference, inputs : Inputs, commands : Commands }) {
        super({ commands })

        this.target = target
        this.inputs = inputs
        this.outputs = new Outputs({ call : this })
    }

    public toString() {
        const outputs = this.outputs.toString()

        return `${outputs ? `${outputs} : ` : ``}${this.target}(${this.inputs})`
    }
}

export type Command = DeclarationCommand | CallCommand

export class Inputs {
    public readonly list : Input[]

    public constructor({ list } : { list : Input[] }) {
        this.list = list
    }

    public toString() {
        return this.list.map(input => input.toString()).join(`, `)
    }
}

export class Input {
    public readonly target : Reference

    public constructor({ target } : { target : Reference }) {
        this.target = target
    }

    public toString() {
        return this.target.toString()
    }
}

export class Outputs {
    public static readonly symbol : unique symbol = Symbol(`l0.syntax.Outputs`)

    public readonly symbol : typeof Outputs.symbol = Outputs.symbol
    public readonly call : CallCommand
    public readonly sub = new SubOutput({ outputs : this })
    public readonly explicit : ExplicitOutput[] = []

    public constructor({ call } : { call : CallCommand }) {
        this.call = call
    }

    public get last() {
        const { sub, explicit } = this

        if (explicit.length > 0) return explicit[explicit.length - 1]

        return sub
    }

    public add(name : Name) {
        const output = new ExplicitOutput({ name, outputs : this })

        const { last } = this

        last.next = output
        output.previous = last

        this.explicit.push(output)
    }

    public toString() {
        return this.explicit.map(output => output.toString()).join()
    }
}

export abstract class GenericOutput {
    public readonly outputs : Outputs
    public readonly name : Name
    public previous : Output | null = null
    public next     : Output | null = null

    public constructor({ name, outputs } : { name : Name, outputs : Outputs }) {
        this.outputs = outputs
        this.name = name
    }

    public toString() {
        return this.name.toString()
    }
}

export class SubOutput extends GenericOutput {
    public static readonly symbol : unique symbol = Symbol(`l0.syntax.SubOutput`)

    public readonly symbol : typeof SubOutput.symbol = SubOutput.symbol

    public constructor({ outputs } : { outputs : Outputs }) {
        super({ name : Name.bare(`sub`), outputs })
    }
}

export class ExplicitOutput extends GenericOutput {
    public static readonly symbol : unique symbol = Symbol(`l0.syntax.ExplicitOutput`)

    public readonly symbol : typeof ExplicitOutput.symbol = ExplicitOutput.symbol
}

export type Output = SubOutput | ExplicitOutput

export type ReferenceTarget = Program | Parameter | Output

export class Reference {
    public readonly name : Name
    public readonly target : ReferenceTarget

    public constructor({ name, target } : { name : Name, target : ReferenceTarget }) {
        this.name = name
        this.target = target
    }

    public toString() {
        return this.name.toString()
    }
}

class Walker {
    private readonly lexemes : lexis.Children
    private index = 0

    public constructor({ lexemes } : { lexemes : lexis.Children }) {
        this.lexemes = lexemes
    }

    private get solid() {
        while (true) {
            if (this.index >= this.lexemes.length) return null

            const lexeme = this.lexemes[this.index]

            if (lexeme.symbol !== lexis.Space.symbol && lexeme.symbol !== lexis.Comment.symbol) return lexeme

            ++this.index
        }
    }

    public get current() {
        return this.solid
    }
    public get next() {
        if (this.index >= this.lexemes.length) return null

        ++this.index

        return this.solid
    }
}
class ProgramWalker extends Walker {
    public readonly program : GenericProgram

    public constructor({
        lexemes,
        program,
    } : {
        lexemes : lexis.Children
        program : GenericProgram
    }) {
        super({ lexemes })

        this.program = program
    }
}

export class Analyzer {
    public analyze(lexemes : lexis.Children) {
        const main = new MainProgram
        let walker = new ProgramWalker({ lexemes, program: main })
        const nesting : ProgramWalker[] = [ walker ]

        function findReference(name : Name, scopeTarget : ScopeTarget) {
            const scope = Scope.from(scopeTarget)

            // console.log(`${scope}`)

            const reference = scope.find(name)

            if (reference) return reference

            const parameter = main.parameters.add(name)

            return new Reference({ name, target : parameter })
        }
        function fillParameters(program : DeclaredProgram, lexemes : lexis.Children) {
            const walker = new Walker({ lexemes })

            while(true) {
                const first = walker.current

                if (!first) break
                if (first.symbol === lexis.Name.symbol) {
                    program.parameters.add(Name.from(first))

                    const second = walker.next

                    if (!second) break
                    if (second.symbol === lexis.Delimiter.symbol && second.type === lexis.DelimiterType.Comma) walker.next
                }
                else throw new Error(`Unexpected ${logLexeme(first)} in parameters list.`)
            }
        }
        function fillInputs(lexemes : lexis.Children, scopeTarget : ScopeTarget) {
            const walker = new Walker({ lexemes })
            const inputs : Input[] = []

            while(true) {
                const first = walker.current

                if (!first) break
                if (first.symbol === lexis.Name.symbol) {
                    const target = findReference(Name.from(first), scopeTarget)

                    inputs.push(new Input({ target }))

                    const second = walker.next

                    if (!second) break
                    if (second.symbol === lexis.Delimiter.symbol && second.type === lexis.DelimiterType.Comma) walker.next
                }
                else throw new Error(`Unexpected ${logLexeme(first)} in parameters list.`)
            }

            return inputs
        }

        while (true) {
            const first = walker.current

            if (!first) {
                nesting.pop()

                if (nesting.length < 1) break

                walker = nesting[nesting.length - 1]

                walker.next
            }
            else if (first.symbol === lexis.Name.symbol) {
                const second = walker.next

                if (!second) throw new Error(`Unexpected end of input.`)
                if (second.symbol === lexis.Block.symbol) {
                    if (second.opening.type !== lexis.BraceType.Round) throw new Error(`Unexpected ${logLexeme(second)}.`)

                    const third = walker.next

                    if (!third || third.symbol === lexis.Name.symbol) {
                        const target = findReference(Name.from(first), walker.program.commands)
                        const inputs = fillInputs(second.children, walker.program.commands)

                        walker.program.commands.call(target, inputs)
                    }
                    else if (third.symbol === lexis.Block.symbol) {
                        if (third.opening.type !== lexis.BraceType.Figure) throw new Error(`Unexpected block ${logLexeme(third)}.`)

                        const { program } = walker.program.commands.declare(Name.from(first))

                        fillParameters(program, second.children)

                        walker = new ProgramWalker({ lexemes : third.children, program })

                        nesting.push(walker)
                    }
                    else throw new Error(`Unexpected ${logLexeme(third)}.`)
                }
                else if (second.symbol === lexis.Delimiter.symbol && second.type == lexis.DelimiterType.Colon) {
                    const third = walker.next

                    if (!third || third.symbol !== lexis.Name.symbol) throw new Error(`Unexpected ${third && logLexeme(third)}.`)

                    const fourth = walker.next

                    if (!fourth || fourth.symbol !== lexis.Block.symbol || fourth.opening.type !== lexis.BraceType.Round) throw new Error(`Unexpected ${fourth && logLexeme(fourth)}.`)

                    const target = findReference(Name.from(third), walker.program.commands)
                    const inputs = fillInputs(fourth.children, walker.program.commands)
                    const call = walker.program.commands.call(target, inputs)

                    call.outputs.add(Name.from(first))

                    walker.next
                }
                else if (second.symbol === lexis.Delimiter.symbol && second.type == lexis.DelimiterType.Comma) {
                    const outputs : Name[] = [ Name.from(first) ]

                    while (true) {
                        const third = walker.next

                        if (!third) throw new Error(`Unexpected end of input.`)
                        if (third.symbol === lexis.Delimiter.symbol && third.type == lexis.DelimiterType.Colon) break
                        if (third.symbol !== lexis.Name.symbol) throw new Error(`Unexpected ${logLexeme(second)}.`)

                        outputs.push(Name.from(third))

                        const fourth = walker.next

                        if (!fourth) throw new Error(`Unexpected end of input.`)
                        if (fourth.symbol === lexis.Delimiter.symbol && fourth.type == lexis.DelimiterType.Comma) continue
                        if (fourth.symbol === lexis.Delimiter.symbol && fourth.type == lexis.DelimiterType.Colon) break

                        throw new Error(`Unexpected ${logLexeme(fourth)}.`)
                    }

                    const third = walker.next

                    if (!third || third.symbol !== lexis.Name.symbol) throw new Error(`Unexpected ${third && logLexeme(third)}.`)

                    const fourth = walker.next

                    if (!fourth || fourth.symbol !== lexis.Block.symbol || fourth.opening.type !== lexis.BraceType.Round) throw new Error(`Unexpected ${fourth && logLexeme(fourth)}.`)

                    const target = findReference(Name.from(third), walker.program.commands)
                    const inputs = fillInputs(fourth.children, walker.program.commands)
                    const call = walker.program.commands.call(target, inputs)

                    for (const output of outputs) call.outputs.add(output)

                    walker.next
                }
                else throw new Error(`Unexpected ${logLexeme(second)}.`)
            }
            else throw new Error(`Unexpected ${logLexeme(first)}.`)
        }

        return main
    }
}

function logLexeme(lexeme : lexis.Child) {
    return `${lexeme} at ${lexeme.span.begin.row}:${lexeme.span.begin.column}`
}
