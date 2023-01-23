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

export abstract class Lexeme {
    public abstract readonly span : Span
    /** Raw text */
    public abstract readonly text : Text

    public toString() {
        return this.text
    }
}

export abstract class Leaf extends Lexeme {
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
    public static readonly symbol : unique symbol = Symbol(`l0.text.Space`)

    public readonly symbol : typeof Space.symbol = Space.symbol
}

export class Comment extends Leaf {
    public static readonly symbol : unique symbol = Symbol(`l0.text.Comment`)

    public readonly symbol : typeof Comment.symbol = Comment.symbol
}

export enum DelimiterType {
    Comma = `comma`,
    Colon = `colon`,
}

export class Delimiter extends Leaf {
    public static readonly symbol : unique symbol = Symbol(`l0.text.Delimiter`)

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
    Square = `square`,
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

export class Opening extends Leaf {
    public static readonly symbol : unique symbol = Symbol(`l0.text.OpeningBrace`)

    public readonly symbol : typeof Opening.symbol = Opening.symbol
    public readonly direction = BraceDirection.Opening
}
export class Closing extends Leaf {
    public static readonly symbol : unique symbol = Symbol(`l0.text.ClosingBrace`)

    public readonly symbol : typeof Closing.symbol = Closing.symbol
    public readonly direction = BraceDirection.Opening
}

export type Child = Space | Comment | Delimiter | Name | Block
export type Children = Child[]

export class Block extends Lexeme {
    public static readonly symbol : unique symbol = Symbol(`l0.text.Block`)

    public readonly symbol : typeof Block.symbol = Block.symbol
    public readonly opening : Opening
    public readonly closing : Closing
    public readonly children : Children

    public constructor({
        children,
        opening,
        closing,
    } : {
        children : Children
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

export abstract class Word extends Leaf {
    public abstract isEqual(word : AnyWord) : boolean
}

export class BareWord extends Word {
    public static readonly symbol : unique symbol = Symbol(`l0.text.BareWord`)

    public readonly symbol : typeof BareWord.symbol = BareWord.symbol

    public isEqual(word : AnyWord) {
        return word.symbol === BareWord.symbol && this.text === word.text
    }
}

export enum Quote {
    Single = `single`,
    Double = `double`,
}

export class QuotedWord extends Word {
    public static readonly symbol : unique symbol = Symbol(`l0.text.QuotedWord`)

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

    public isEqual(word : AnyWord) {
        return word.symbol === QuotedWord.symbol && this.text === word.text
    }
}

export type AnyWord = BareWord | QuotedWord
export type NamePart = Space | AnyWord

export class Name extends Lexeme {
    public static readonly symbol : unique symbol = Symbol(`l0.text.Name`)

    public static isPartWord(part : NamePart) : part is AnyWord {
        if (part.symbol === BareWord.symbol) return true
        if (part.symbol === QuotedWord.symbol) return true
        if (part.symbol === Space.symbol) return false

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

export class Processor {
    public process(text : Text) : Children {
        const children : Children = []
        const locator = new Locator({ text })
        const slicer = new Slicer({ locator })

        while (true) {
            const character = locator.character

            if (character === null) break
            else if (character.match(emptyCharacter)) {
                while (locator.next?.match(emptyCharacter));

                const space = slicer.slice(params => new Space(params))

                children.push(space)
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

                children.push(comment)
            }
            else if (character === `,`) {
                locator.next

                const delimiter = slicer.slice(params => new Delimiter({ type : DelimiterType.Comma, ...params }))

                children.push(delimiter)
            }
            else if (character === `:`) {
                locator.next

                const delimiter = slicer.slice(params => new Delimiter({ type : DelimiterType.Colon, ...params }))

                children.push(delimiter)
            }
            else {
                throw new Error // @todo
            }
        }

        return children
    }
}

const emptyCharacter = /^\s$/
