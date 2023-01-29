import * as lexis from './lexis'

export type Text = string

export abstract class Word {
    public static from(word : lexis.BareWord | lexis.QuotedWord) {
        if (word.symbol === lexis.BareWord.symbol) return BareWord.from(word)
        if (word.symbol === lexis.QuotedWord.symbol) return QuotedWord.from(word)

        neverThrow(word, new Error(`Unexpected word ${word}.`))
    }

    public readonly text : Text

    public constructor({ text } : { text : Text }) {
        this.text = text
    }

    public toString() {
        return this.text
    }
}

export class BareWord extends Word {
    public static readonly symbol : unique symbol = Symbol(`l0.syntax.BareWord`)

    public static from(word : lexis.BareWord) {
        return new BareWord(word)
    }

    public readonly symbol : typeof BareWord.symbol = BareWord.symbol
}

export class QuotedWord extends Word {
    public static readonly symbol : unique symbol = Symbol(`l0.syntax.QuotedWord`)

    public static from(word : lexis.QuotedWord) {
        return new QuotedWord(word)
    }

    public readonly symbol : typeof QuotedWord.symbol = QuotedWord.symbol
}

export type WordUnion = BareWord | QuotedWord

export class Name {
    public static from(name : lexis.Name) {
        return new Name({ words : name.words.map(Word.from) })
    }

    public readonly words : WordUnion[]

    public constructor({ words } : { words : WordUnion[] }) {
        this.words = words
    }

    public get overlapped() {
        const words = this.words.slice()
        const first = words[0]

        if (first.symbol === BareWord.symbol) words[0] = new BareWord({ text : `/` + first.text })
        else words.unshift(new BareWord({ text : `/` }))

        return new Name({ words })
    }

    public toString() {
        return this.words.map(word => word.toString()).join(` `)
    }
}

export class Scope {
}

export abstract class GenericProgram {
    public readonly parameters = new Parameters
    public readonly commands = new Commands

    public toString() {
        return `(${this.parameters}) {${this.commands}}`
            .replace(/^/g, `\t`)
            .replace(/\n/g, `\n\t`)
    }
}

export class Main extends GenericProgram {
    public static readonly symbol : unique symbol = Symbol(`l0.syntax.Main`)

    public readonly symbol : typeof Main.symbol = Main.symbol
}

export class Program extends GenericProgram {
    public static readonly symbol : unique symbol = Symbol(`l0.syntax.Program`)

    public readonly symbol : typeof Program.symbol = Program.symbol
}

export class Parameters {
    public readonly implicit : ImplicitParameter[] = []
    public readonly super : SuperParameter = new SuperParameter
    public readonly explicit : ExplicitParameter[] = []

    public add(name : Name) {
        const parameter = new ExplicitParameter({ name })

        this.explicit.push(parameter)
    }

    public toString() {
        return this.explicit.map(parameter => parameter.toString()).join(` `)
    }
}

export abstract class Parameter {
    public readonly name : Name

    public constructor({ name } : { name : Name }) {
        this.name = name
    }

    public toString() {
        return this.name.toString()
    }
}

export class ImplicitParameter extends Parameter {
    public static readonly symbol : unique symbol = Symbol(`l0.syntax.ImplicitParameter`)

    public readonly symbol : typeof ImplicitParameter.symbol = ImplicitParameter.symbol
}

export class SuperParameter extends Parameter {
    public static readonly symbol : unique symbol = Symbol(`l0.syntax.SuperParameter`)

    public readonly symbol : typeof SuperParameter.symbol = SuperParameter.symbol

    public constructor() {
        super({ name : new Name({ words : [ new BareWord({ text : `super` }) ] }) })
    }
}

export class ExplicitParameter extends Parameter {
    public static readonly symbol : unique symbol = Symbol(`l0.syntax.ExplicitParameter`)

    public readonly symbol : typeof ExplicitParameter.symbol = ExplicitParameter.symbol
}

export type ParameterUnion = ImplicitParameter | SuperParameter | ExplicitParameter

export class Commands {
    public readonly list : CommandUnion[] = []

    public declare(name : Name, program : Program) {
        const declaration = new Declaration({ name, program })

        this.list.push(declaration)
    }
    public call(target : Reference, inputs : Input[], outputs : ExplicitOutput[] = []) {
        const call = new Call({
            target,
            inputs : new Inputs({ list : inputs }),
            outputs : new Outputs({ explicit : outputs }),
        })

        this.list.push(call)
    }

    public toString() {
        return this.list.map(command => command.toString()).join(`\n`)
    }
}

export abstract class Command {
    public abstract toString() : string
}

export class Declaration extends Command {
    public static readonly symbol : unique symbol = Symbol(`l0.syntax.DeclarationCommand`)

    public readonly symbol : typeof Declaration.symbol = Declaration.symbol
    public readonly name : Name
    public readonly program : Program

    public constructor({ name, program } : { name : Name, program : Program }) {
        super()

        this.name = name
        this.program = program
    }

    public toString() {
        return `${this.name} ${this.program}`
    }
}

export class Call extends Command {
    public static readonly symbol : unique symbol = Symbol(`l0.syntax.CallCommand`)

    public readonly symbol : typeof Call.symbol = Call.symbol
    public readonly target : Reference
    public readonly inputs : Inputs
    public readonly outputs : Outputs

    public constructor({ target, inputs, outputs } : { target : Reference, inputs : Inputs, outputs : Outputs }) {
        super()

        this.target = target
        this.inputs = inputs
        this.outputs = outputs
    }

    public toString() {
        const outputs = this.outputs.toString()

        return `${outputs ? `${outputs} : ` : ``}${this.target}(${this.inputs})`
    }
}

export type CommandUnion = Declaration | Call

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
    public readonly explicit : ExplicitOutput[]

    public constructor({ explicit } : { explicit : ExplicitOutput[] }) {
        this.explicit = explicit
    }

    public toString() {
        return this.explicit.map(output => output.toString()).join()
    }
}

export abstract class Output {
    public readonly name : Name

    public constructor({ name } : { name : Name }) {
        this.name = name
    }

    public toString() {
        return this.name.toString()
    }
}

export class SubOutput extends Output {
    public static readonly symbol : unique symbol = Symbol(`l0.syntax.SubOutput`)

    public readonly symbol : typeof SubOutput.symbol = SubOutput.symbol
}

export class ExplicitOutput extends Output {
    public static readonly symbol : unique symbol = Symbol(`l0.syntax.ExplicitOutput`)

    public readonly symbol : typeof ExplicitOutput.symbol = ExplicitOutput.symbol
}

export type OutputUnion = SubOutput | ExplicitOutput

export class Reference {
    public readonly name : Name

    public constructor({ name } : { name : Name }) {
        this.name = name
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
    private fillParameters(program : Program, lexemes : lexis.Children) {
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
    private fillInputs(lexemes : lexis.Children) {
        const walker = new Walker({ lexemes })
        const inputs : Input[] = []

        while(true) {
            const first = walker.current

            if (!first) break
            if (first.symbol === lexis.Name.symbol) {
                inputs.push(new Input({ target : new Reference({ name : Name.from(first) }) }))

                const second = walker.next

                if (!second) break
                if (second.symbol === lexis.Delimiter.symbol && second.type === lexis.DelimiterType.Comma) walker.next
            }
            else throw new Error(`Unexpected ${logLexeme(first)} in parameters list.`)
        }

        return inputs
    }

    public analyze(lexemes : lexis.Children) {
        const program = new Main
        let walker = new ProgramWalker({ lexemes, program })
        const nesting : ProgramWalker[] = [ walker ]

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
                        const target = new Reference({ name : Name.from(first) })
                        const inputs = this.fillInputs(second.children)

                        walker.program.commands.call(target, inputs)
                    }
                    else if (third.symbol === lexis.Block.symbol) {
                        if (third.opening.type !== lexis.BraceType.Figure) throw new Error(`Unexpected block ${logLexeme(third)}.`)

                        const program = new Program

                        this.fillParameters(program, second.children)

                        walker.program.commands.declare(Name.from(first), program)

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

                    const target = new Reference({ name : Name.from(third) })
                    const inputs = this.fillInputs(fourth.children)
                    const output = new ExplicitOutput({ name : Name.from(first) })

                    walker.program.commands.call(target, inputs, [ output ] )
                    walker.next
                }
                else throw new Error(`Unexpected ${logLexeme(second)}.`)
            }
            else throw new Error(`Unexpected ${logLexeme(first)}.`)
        }

        return program
    }
}

function neverThrow(never : never, error : Error) : never {
    throw error
}
function logLexeme(lexeme : lexis.Child) {
    return `${lexeme} at ${lexeme.span.begin.row}:${lexeme.span.begin.column}`
}
