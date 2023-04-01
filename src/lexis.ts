import { neverThrow } from "./utilities"

export type Offset = number
export type Row = number
export type Column = number

export class Location {
    /** Absolute position from the beginning of the text */
    public readonly offset : Offset
    public readonly row : Row
    public readonly column : Column

    public constructor({
        offset,
        row,
        column,
    } : {
        offset : Offset
        row : Row
        column : Column
    }) {
        this.offset = offset
        this.row = row
        this.column = column
    }
}
export class Span {
    public readonly begin : Location
    public readonly end : Location

    public constructor({
        begin,
        end,
    } : {
        begin : Location
        end : Location
    }) {
        this.begin = begin
        this.end = end
    }
}

export type Text = string

export abstract class GenericLexeme {
    public abstract readonly span : Span
    /** Raw text */
    public abstract readonly text : Text

    public toString() {
        return this.text
    }
}

export abstract class Leaf extends GenericLexeme {
    public readonly span : Span
    /** Raw text */
    public readonly text : Text

    public constructor({
        span,
        text,
    } : {
        span : Span
        text : Text
    }) {
        super()

        this.span = span
        this.text = text
    }
}

export class Space extends Leaf {
    public static readonly symbol : unique symbol = Symbol(`l0.lexis.Space`)

    public readonly symbol : typeof Space.symbol = Space.symbol
}

export class Comment extends Leaf {
    public static readonly symbol : unique symbol = Symbol(`l0.lexis.Comment`)

    public readonly symbol : typeof Comment.symbol = Comment.symbol
}

export enum DelimiterType {
    Comma = `comma`,
    Colon = `colon`,
}

export class Delimiter extends Leaf {
    public static readonly symbol : unique symbol = Symbol(`l0.lexis.Delimiter`)

    public readonly symbol : typeof Delimiter.symbol = Delimiter.symbol
    public readonly type : DelimiterType

    public constructor({
        span,
        text,
        type,
    } : {
        span : Span
        text : Text
        type : DelimiterType
    }) {
        super({ span, text })

        this.type = type
    }
}

export enum BraceType {
    Round = `round`,
    Figure = `figure`,
}
export enum BraceDirection {
    Opening = `opening`,
    Closing = `closing`,
}

export abstract class Brace extends Leaf {
    public abstract readonly direction : BraceDirection

    public readonly type : BraceType

    public constructor({
        span,
        text,
        type,
    } : {
        span : Span
        text : Text
        type : BraceType
    }) {
        super({ span, text })

        this.type = type
    }
}

export class Opening extends Brace {
    public static readonly symbol : unique symbol = Symbol(`l0.lexis.OpeningBrace`)

    public readonly symbol : typeof Opening.symbol = Opening.symbol
    public readonly direction = BraceDirection.Opening
}
export class Closing extends Brace {
    public static readonly symbol : unique symbol = Symbol(`l0.lexis.ClosingBrace`)

    public readonly symbol : typeof Closing.symbol = Closing.symbol
    public readonly direction = BraceDirection.Closing
}

export type Lexeme = Space | Comment | Delimiter | Name | Block
export type Lexemes = Lexeme[]

export class Block extends GenericLexeme {
    public static readonly symbol : unique symbol = Symbol(`l0.lexis.Block`)

    public readonly symbol : typeof Block.symbol = Block.symbol
    public readonly opening : Opening
    public readonly closing : Closing
    public readonly children : Lexemes

    public constructor({
        children,
        opening,
        closing,
    } : {
        children : Lexemes
        opening : Opening
        closing : Closing
    }) {
        super()

        this.children = children
        this.opening = opening
        this.closing = closing
    }

    public get span() {
        return new Span({
            begin : this.opening.span.begin,
            end : this.closing.span.end,
        })
    }
    public get text() : Text {
        return [ this.opening, ...this.children, this.closing ]
            .map(lexeme => lexeme.text)
            .join(``)
    }
}

export abstract class GenericWord extends Leaf {
    public abstract isEqual(word : Word) : boolean
}

export class BareWord extends GenericWord {
    public static readonly symbol : unique symbol = Symbol(`l0.lexis.BareWord`)

    public readonly symbol : typeof BareWord.symbol = BareWord.symbol

    public isEqual(word : Word) {
        return word.symbol === BareWord.symbol && this.text === word.text
    }
}

export enum Quote {
    Single = `single`,
    Double = `double`,
}

export class QuotedWord extends GenericWord {
    public static readonly symbol : unique symbol = Symbol(`l0.lexis.QuotedWord`)

    public readonly symbol : typeof QuotedWord.symbol = QuotedWord.symbol
    public readonly quote : Quote
    /** Unquoted text without escaping */
    public readonly unquoted : Text

    public constructor({
        span,
        text,
        quote,
        unquoted,
    } : {
        span : Span
        text : Text
        quote : Quote
        unquoted : Text
    }) {
        super({ span, text })

        this.quote = quote
        this.unquoted = unquoted
    }

    public isEqual(word : Word) {
        return word.symbol === QuotedWord.symbol && this.text === word.text
    }
}

export type Word = BareWord | QuotedWord
export type NamePart = Space | Comment | Word

export class Name extends GenericLexeme {
    public static readonly symbol : unique symbol = Symbol(`l0.lexis.Name`)

    public static isPartWord(part : NamePart) : part is Word {
        if (part.symbol === BareWord.symbol) return true
        if (part.symbol === QuotedWord.symbol) return true
        if (part.symbol === Space.symbol) return false
        if (part.symbol === Comment.symbol) return false

        const never : never = part

        throw new Error(`Unexpected name part: ${never}`)
    }

    public readonly symbol : typeof Name.symbol = Name.symbol
    public readonly parts : NamePart[]

    public constructor({
        parts,
    } : {
        parts : NamePart[]
    }) {
        if (parts.length < 1) throw new Error(`Name should have at least one part.`)
        if (parts[0].symbol === Space.symbol) throw new Error(`Name cannot starts with space.`)
        if (parts[parts.length - 1].symbol === Space.symbol) throw new Error(`Name cannot ends with space.`)

        super()

        this.parts = parts
    }

    public get span() {
        const { parts } = this

        return new Span({
            begin : parts[0].span.begin,
            end : parts[parts.length - 1].span.end,
        })
    }
    public get text() {
        return this.parts
            .map(lexeme => lexeme.text)
            .join(``)
    }
    public get words() {
        return this.parts.filter(Name.isPartWord)
    }

    public isEqual(other : Name) {
        return (
            this.words.length === other.words.length &&
            this.words.every((word, index) => word.isEqual(other.words[index]))
        )
    }
    public toString() {
        return this.words.join(` `)
    }
}

export class Locator {
    private offset : Offset = 0
    private row : Row = 0
    private column : Column = 0
    public readonly text : Text

    public constructor({
        text,
    } : {
        text : Text
    }) {
        this.text = text
    }

    public get character() {
        const { offset, text } = this

        if (offset >= text.length) return null

        return text[offset]
    }
    public get location() {
        const { offset, row, column } = this

        return new Location({ offset, row, column })
    }
    public get next() : string | null {
        const current = this.character

        if (current === null) return null

        this.offset++
        this.column++

        if (current === `\n`) {
            this.row++
            this.column = 0
        }

        return this.character
    }
}

class Slicer {
    private readonly locator : Locator
    private begin : Location

    public constructor({ locator } : { locator : Locator }) {
        this.locator = locator
        this.begin = locator.location
    }

    public slice<T>(factory : (params : { span : Span, text : Text }) => T) {
        const end = this.locator.location
        const span = new Span({ begin : this.begin, end })
        const text = this.locator.text.substring(span.begin.offset, span.end.offset)

        this.begin = end

        const lexeme = factory({ span, text })

        return lexeme
    }
}

export class Analyzer {
    public analyze(text : Text) : Lexemes {
        class Nesting {
            public readonly opening : Opening
            public readonly children : Lexemes = []

            public constructor({ opening } : { opening : Opening }) {
                this.opening  = opening
            }
        }

        const locator = new Locator({ text })
        const slicer = new Slicer({ locator })
        const children : Lexemes = []
        const nesting : Nesting[] = []
        const nameParts : NamePart[] = []

        function top() {
            const top = nesting.length > 0
                ? nesting[nesting.length - 1].children
                : children

            return top
        }
        function append(child : Lexeme) {
            top().push(child)
        }
        function appendSpacing(part : Space | Comment) {
            if (nameParts.length < 1) return append(part)

            nameParts.push(part)
        }
        function endName() {
            if (nameParts.length < 1) return
            if (!nameParts.some(part => [ BareWord.symbol, QuotedWord.symbol ].includes(part.symbol))) throw new Error(`Unexpected empty name.`)

            const tail : (Space | Comment)[] = []

            while (true) {
                const last = nameParts[nameParts.length - 1]

                if (last.symbol === BareWord.symbol || last.symbol === QuotedWord.symbol) break

                tail.push(last)
                nameParts.pop()
            }

            const name = new Name({ parts : nameParts.slice() })

            nameParts.splice(0, nameParts.length)

            append(name)
            tail.forEach(append)
        }

        while (true) {
            const character = locator.character

            if (character === null) {
                endName()

                break
            }
            else if (isWhitespace(character)) {
                while (isWhitespace(locator.next));

                const space = slicer.slice(params => new Space(params))

                appendSpacing(space)
            }
            else if (character === `;`) {
                while (true) {
                    const character = locator.next

                    if (character === null || character === `\n`) {
                        locator.next // safe to call next on null

                        break
                    }
                }

                const comment = slicer.slice(params => new Comment(params))

                appendSpacing(comment)
            }
            else if (character === `,` || character === `:`) {
                endName()

                const type =
                    character === `,` ? DelimiterType.Comma :
                    character === `:` ? DelimiterType.Colon :
                    neverThrow(character, new Error(`Unexpected character ${character}.`))

                locator.next

                const delimiter = slicer.slice(params => new Delimiter({ type, ...params }))

                append(delimiter)
            }
            else if (character === `(` || character === `{`) {
                endName()

                const type =
                    character === `(` ? BraceType.Round :
                    character === `{` ? BraceType.Figure :
                    neverThrow(character, new Error(`Unexpected character ${character}.`))

                locator.next

                const opening = slicer.slice(params => new Opening({ type, ...params }))

                nesting.push(new Nesting({ opening }))
            }
            else if (character === `)` || character === `}`) {
                if (nesting.length < 1) throw new Error(`Closing unopened block.`)

                endName()

                const type =
                    character === `)` ? BraceType.Round :
                    character === `}` ? BraceType.Figure :
                    neverThrow(character, new Error(`Unexpected character ${character}.`))

                const { opening, children } = nesting[nesting.length - 1]

                if (opening.type !== type) throw new Error(`Block braces doesn't match: ${opening.toString()} (${opening.type}) != ${character} ${type}.`)

                locator.next

                const closing = slicer.slice(params => new Closing({ type, ...params }))
                const block = new Block({ opening, closing, children })

                nesting.pop()

                append(block)
            }
            else if (character === `'` || character === `"`) {
                const quoteCharacter = character
                let unquoted = ``

                while (true) {
                    const character = locator.next

                    if (character === null) throw new Error(`Unclosed quoted word.`)
                    if (character === quoteCharacter) break

                    unquoted += character
                }

                locator.next

                const quote =
                    quoteCharacter === `'` ? Quote.Single :
                    quoteCharacter === `"` ? Quote.Double :
                    neverThrow(quoteCharacter, new Error(`Unexpected character ${quoteCharacter}.`))
                const quoted = slicer.slice(params => new QuotedWord({ quote, unquoted, ...params }))

                nameParts.push(quoted)
            }
            else if (isWordCharacter(character)) {
                while (true) {
                    const character = locator.next

                    if (character === null || !isWordCharacter(character)) break
                }

                const bare = slicer.slice(params => new BareWord({ ...params }))

                nameParts.push(bare)
            }
            else {
                throw new Error(`Unexpected character ${character}`)
            }
        }

        if (nesting.length > 0) throw new Error(`${nesting.length} unclosed blocks.`)

        return children
    }
}

// For escape sequences see https://en.wikipedia.org/wiki/Escape_character
// Fo whitespace list see https://stackoverflow.com/a/6507078/13502024
const spaceCharacter                   = ` `
const newLineCharacter                 = `\n`
const carriageReturnCharacter          = `\r`
const tabCharacter                     = `\t`
const formFeedCharacter                = `\f`
const verticalTabCharacter             = `\v`
const noBreakSpaceCharacter            = `\u00a0` // see https://unicode-table.com/en/00A0/
const oghamSpaceMarkCharacter          = `\u1680` // see https://unicode-table.com/en/1680/
const enQuadCharacter                  = `\u2000` // see https://unicode-table.com/en/2000/
const emQuadCharacter                  = `\u2001` // see https://unicode-table.com/en/2001/
const enSpaceCharacter                 = `\u2002` // see https://unicode-table.com/en/2002/
const emSpaceCharacter                 = `\u2003` // see https://unicode-table.com/en/2003/
const threePerEmSpaceCharacter         = `\u2004` // see https://unicode-table.com/en/2004/
const fourPerEmSpaceCharacter          = `\u2005` // see https://unicode-table.com/en/2005/
const sixPerEmSpaceCharacter           = `\u2006` // see https://unicode-table.com/en/2006/
const figureSpaceCharacter             = `\u2007` // see https://unicode-table.com/en/2007/
const punctuationSpaceCharacter        = `\u2008` // see https://unicode-table.com/en/2008/
const thinSpaceCharacter               = `\u2009` // see https://unicode-table.com/en/2009/
const hairSpaceCharacter               = `\u200a` // see https://unicode-table.com/en/200a/
const lineSeparatorCharacter           = `\u2028` // see https://unicode-table.com/en/2028/
const paragraphSeparatorCharacter      = `\u2029` // see https://unicode-table.com/en/2029/
const narrowNoBreakSpaceCharacter      = `\u202f` // see https://unicode-table.com/en/202F/
const mediumMathematicalSpaceCharacter = `\u205f` // see https://unicode-table.com/en/205F/
const ideographicSpaceCharacter        = `\u3000` // see https://unicode-table.com/en/3000/
const zeroWidthNoBreakSpaceCharacter   = `\ufeff` // see https://unicode-table.com/en/FEFF/

type WhitespaceCharacter =
    | typeof spaceCharacter
    | typeof newLineCharacter
    | typeof carriageReturnCharacter
    | typeof tabCharacter
    | typeof formFeedCharacter
    | typeof verticalTabCharacter
    | typeof noBreakSpaceCharacter
    | typeof oghamSpaceMarkCharacter
    | typeof enQuadCharacter
    | typeof emQuadCharacter
    | typeof enSpaceCharacter
    | typeof emSpaceCharacter
    | typeof threePerEmSpaceCharacter
    | typeof fourPerEmSpaceCharacter
    | typeof sixPerEmSpaceCharacter
    | typeof figureSpaceCharacter
    | typeof punctuationSpaceCharacter
    | typeof thinSpaceCharacter
    | typeof hairSpaceCharacter
    | typeof lineSeparatorCharacter
    | typeof paragraphSeparatorCharacter
    | typeof narrowNoBreakSpaceCharacter
    | typeof mediumMathematicalSpaceCharacter
    | typeof ideographicSpaceCharacter
    | typeof zeroWidthNoBreakSpaceCharacter

function isWhitespace(character : string | null) : character is WhitespaceCharacter {
    if (character === spaceCharacter) return true
    if (character === newLineCharacter) return true
    if (character === carriageReturnCharacter) return true
    if (character === tabCharacter) return true
    if (character === formFeedCharacter) return true
    if (character === verticalTabCharacter) return true
    if (character === noBreakSpaceCharacter) return true
    if (character === oghamSpaceMarkCharacter) return true
    if (character === enQuadCharacter) return true
    if (character === emQuadCharacter) return true
    if (character === enSpaceCharacter) return true
    if (character === emSpaceCharacter) return true
    if (character === threePerEmSpaceCharacter) return true
    if (character === fourPerEmSpaceCharacter) return true
    if (character === sixPerEmSpaceCharacter) return true
    if (character === figureSpaceCharacter) return true
    if (character === punctuationSpaceCharacter) return true
    if (character === thinSpaceCharacter) return true
    if (character === hairSpaceCharacter) return true
    if (character === lineSeparatorCharacter) return true
    if (character === paragraphSeparatorCharacter) return true
    if (character === narrowNoBreakSpaceCharacter) return true
    if (character === mediumMathematicalSpaceCharacter) return true
    if (character === ideographicSpaceCharacter) return true
    if (character === zeroWidthNoBreakSpaceCharacter) return true

    return false
}
function isWordCharacter(character : string) {
    if (isWhitespace(character)) return false
    if (character === `;`) return false
    if (character === `,`) return false
    if (character === `:`) return false
    if (character === `(`) return false
    if (character === `)`) return false
    if (character === `{`) return false
    if (character === `}`) return false
    if (character === `'`) return false
    if (character === `"`) return false

    return true
}
