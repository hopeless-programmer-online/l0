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
    public readonly unquoted : Text

    public constructor({ text, unquoted } : { text : Text, unquoted : Text }) {
        super({ text })

        this.unquoted = unquoted
    }

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

    private _string : string | null = null

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
        if (this._string !== null) return this._string

        const { words } = this
        const { length } = words

        this._string = words[0].toString()

        for (let i = 1; i < length; ++i) this._string += ` ` + words[i].toString()

        return this._string

//         const { words } = this
//         const { length } = words
//
//         let result = words[0].toString()
//
//         for (let i = 1; i < length; ++i) result += ` ` + words[i].toString()
//
//         return result

        // return this.words.map(word => word.toString()).join(` `)
    }
}

export abstract class GenericProgram {
    public abstract readonly parameters : Parameters
    public abstract readonly commands : Commands

    public toString() {
        let commands = `${this.commands}`
            .replace(/\n/g, `\n    `)

        if (commands !== ``) commands = `    ` + commands

        return `(${this.parameters}) {${commands !== `` ? `\n${commands}` : ``}\n}`
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

    public * [Symbol.iterator]() {
        yield this.super
        yield * this.explicit
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
    public map<T>(callback : (parameter : Parameter, index : number, parameters : Parameters) => T) {
        return [ ...this ].map((parameter, index) => callback(parameter, index, this))
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

    public get first() {
        const { list } = this

        return list.length > 0 ? list[0] : null
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

    public map<T>(callback : (input : Input, index : number, inputs : Inputs) => T) {
        return this.list.map((input, index) => callback(input, index, this))
    }
    public toString() {
        return this.list.map(input => input.toString()).join(`, `)
    }
}

export class Input {
    public readonly reference : Reference

    public constructor({ reference } : { reference : Reference }) {
        this.reference = reference
    }

    public toString() {
        return this.reference.toString()
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

    public * [Symbol.iterator]() {
        yield this.sub
        yield * this.explicit
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
    private readonly lexemes : lexis.Lexemes
    private index = 0

    public constructor({ lexemes } : { lexemes : lexis.Lexemes }) {
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
class ProgramWalker1 extends Walker {
    public readonly scope : Scope
    public readonly program : GenericProgram

    public constructor({
        lexemes,
        scope,
        program,
    } : {
        lexemes : lexis.Lexemes
        scope : Scope
        program : GenericProgram
    }) {
        super({ lexemes })

        this.scope = scope
        this.program = program
    }
}
class Scope {
    private map = new Map<Text, ReferenceTarget>()

    public constructor({ map = new Map } : { map? : Map<Text, ReferenceTarget> } = {}) {
        this.map = map
    }

    public add(name : Name, target : ReferenceTarget) {
        const reference = new Reference({ name, target })
        const { map } = this
        let text = name.toString()

        while (true) {
            const existing = map.get(text)

            map.set(text, target)

            if (!existing) break

            // name = name.overlapped
            // text = name.toString()
            text = text[0] === `"`
                ? `/ ` + text
                : `/` + text
            target = existing
        }

        return reference
    }
    public get(name : Name) {
        const target = this.map.get(name.toString())

        if (!target) return null

        return new Reference({ name, target })
    }
    public clone() {
        const map = new Map(this.map)

        return new Scope({ map })
    }
}

export class Analyzer {
    public analyze(lexemes : lexis.Lexemes) {
        const main = new MainProgram
        const globalScope = new Scope
        let walker = new ProgramWalker1({ lexemes, scope : new Scope, program : main })

        for (const parameter of main.parameters) walker.scope.add(parameter.name, parameter)

        const nesting : ProgramWalker1[] = [ walker ]

        function findReference(name : Name) {
            const { scope } = nesting[nesting.length - 1]
            let reference = scope.get(name)

            if (reference) return reference

            reference = globalScope.get(name)

            if (reference) return reference

            const parameter = main.parameters.add(name)

            return globalScope.add(name, parameter)
        }
        function fillParameters(program : DeclaredProgram, lexemes : lexis.Lexemes) {
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
        function fillInputs(lexemes : lexis.Lexemes) {
            const walker = new Walker({ lexemes })
            const inputs : Input[] = []

            while(true) {
                const first = walker.current

                if (!first) break
                if (first.symbol === lexis.Name.symbol) {
                    const reference = findReference(Name.from(first))

                    inputs.push(new Input({ reference }))

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
                        const target = findReference(Name.from(first))
                        const inputs = fillInputs(second.children)
                        const call = walker.program.commands.call(target, inputs)

                        for (const output of call.outputs) walker.scope.add(output.name, output)
                    }
                    else if (third.symbol === lexis.Block.symbol) {
                        if (third.opening.type !== lexis.BraceType.Figure) throw new Error(`Unexpected block ${logLexeme(third)}.`)

                        const { name, program } = walker.program.commands.declare(Name.from(first))

                        fillParameters(program, second.children)

                        walker.scope.add(name, program)

                        walker = new ProgramWalker1({
                            lexemes : third.children,
                            scope : walker.scope.clone(),
                            program,
                        })

                        for (const parameter of program.parameters) walker.scope.add(parameter.name, parameter)

                        nesting.push(walker)
                    }
                    else throw new Error(`Unexpected ${logLexeme(third)}.`)
                }
                else if (second.symbol === lexis.Delimiter.symbol && second.type == lexis.DelimiterType.Colon) {
                    const third = walker.next

                    if (!third || third.symbol !== lexis.Name.symbol) throw new Error(`Unexpected ${third && logLexeme(third)}.`)

                    const fourth = walker.next

                    if (!fourth || fourth.symbol !== lexis.Block.symbol || fourth.opening.type !== lexis.BraceType.Round) throw new Error(`Unexpected ${fourth && logLexeme(fourth)}.`)

                    const target = findReference(Name.from(third))
                    const inputs = fillInputs(fourth.children)
                    const call = walker.program.commands.call(target, inputs)

                    call.outputs.add(Name.from(first))

                    for (const output of call.outputs) walker.scope.add(output.name, output)

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

                    const target = findReference(Name.from(third))
                    const inputs = fillInputs(fourth.children)
                    const call = walker.program.commands.call(target, inputs)

                    for (const output of outputs) call.outputs.add(output)
                    for (const output of call.outputs) walker.scope.add(output.name, output)

                    walker.next
                }
                else throw new Error(`Unexpected ${logLexeme(second)}.`)
            }
            else throw new Error(`Unexpected ${logLexeme(first)}.`)
        }

        return main
    }
}

function logLexeme(lexeme : lexis.Lexeme) {
    return `${lexeme} at ${lexeme.span.begin.row}:${lexeme.span.begin.column}`
}
