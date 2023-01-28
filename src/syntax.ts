import * as lexis from './lexis'

export type Text = string

export abstract class Word {
    public readonly text : Text

    public constructor({ text } : { text : Text }) {
        this.text = text
    }
}

export class BareWord extends Word {
    public static readonly symbol : unique symbol = Symbol(`l0.syntax.BareWord`)

    public readonly symbol : typeof BareWord.symbol = BareWord.symbol
}

export class QuotedWord extends Word {
    public static readonly symbol : unique symbol = Symbol(`l0.syntax.QuotedWord`)

    public readonly symbol : typeof QuotedWord.symbol = QuotedWord.symbol
}

export type WordUnion = BareWord | QuotedWord

export class Name {
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
}

export class Scope {
}

export abstract class GenericProgram {
    public readonly parameters = new Parameters
    public readonly commands = new Commands
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
    public * [Symbol.iterator]() : Iterator<ParameterUnion, void> {
    }
}

export abstract class Parameter {
}

export class ClosureParameter extends Parameter {
    public static readonly symbol : unique symbol = Symbol(`l0.syntax.ClosureParameter`)

    public readonly symbol : typeof ClosureParameter.symbol = ClosureParameter.symbol
}

export class SuperParameter extends Parameter {
    public static readonly symbol : unique symbol = Symbol(`l0.syntax.SuperParameter`)

    public readonly symbol : typeof SuperParameter.symbol = SuperParameter.symbol
}

export class ExplicitParameter extends Parameter {
    public static readonly symbol : unique symbol = Symbol(`l0.syntax.ExplicitParameter`)

    public readonly symbol : typeof ExplicitParameter.symbol = ExplicitParameter.symbol
}

export type ParameterUnion = ClosureParameter | SuperParameter | ExplicitParameter

export class Commands {
    public readonly list : CommandUnion[] = []

    public declare(program : Program) {
        const declaration = new Declaration({ program })

        this.list.push(declaration)
    }
}

export abstract class Command {
}

export class Declaration extends Command {
    public static readonly symbol : unique symbol = Symbol(`l0.syntax.DeclarationCommand`)

    public readonly symbol : typeof Declaration.symbol = Declaration.symbol
    public readonly program : Program

    public constructor({ program } : { program : Program }) {
        super()

        this.program = program
    }
}

export class Call extends Command {
    public static readonly symbol : unique symbol = Symbol(`l0.syntax.CallCommand`)

    public readonly symbol : typeof Call.symbol = Call.symbol
    // public readonly target
    public readonly inputs : Inputs
    public readonly outputs : Outputs

    public constructor() {
        throw new Error // @todo

        super()
    }
}

export type CommandUnion = Declaration | Call

export class Inputs {
    public * [Symbol.iterator]() : Iterator<Input, void> {
    }
}

export class Input {
}

export class Outputs {
    public * [Symbol.iterator]() : Iterator<OutputUnion, void> {
    }
}

export abstract class Output {
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

class Walker {
    private readonly lexemes : lexis.Children
    private index = 0

    public readonly program : GenericProgram

    public constructor({
        lexemes,
        program,
    } : {
        lexemes : lexis.Children
        program : GenericProgram
    }) {
        this.lexemes = lexemes
        this.program = program
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

export class Analyzer {
    public analyze(lexemes : lexis.Children) {
        const program = new Main
        let walker = new Walker({ lexemes, program })
        const nesting : Walker[] = [ walker ]

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
                    if (second.opening.type !== lexis.BraceType.Round) throw new Error(`Unexpected block ${logLexeme(second)}.`)

                    const third = walker.next

                    if (!third) throw new Error(`Unexpected end of input.`)
                    if (third.symbol === lexis.Block.symbol) {
                        if (third.opening.type !== lexis.BraceType.Figure) throw new Error(`Unexpected block ${logLexeme(third)}.`)

                        const program = new Program

                        walker.program.commands.declare(program)

                        walker = new Walker({ lexemes : third.children, program })

                        nesting.push(walker)
                    }
                    else throw new Error(`Unexpected lexeme ${logLexeme(third)}.`)
                }
                else throw new Error(`Unexpected lexeme ${logLexeme(second)}.`)
            }
            else throw new Error(`Unexpected lexeme ${logLexeme(first)}.`)
        }

        return program
    }
}

function logLexeme(lexeme : lexis.Child) {
    return `${lexeme} at ${lexeme.span.begin.row}:${lexeme.span.begin.column}`
}
