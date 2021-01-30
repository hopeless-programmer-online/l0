import { Colon, Comma, CurlyClosing, CurlyOpening, Identifier, Location, RoundClosing, RoundOpening, SquareClosing, SquareOpening } from '../text'

export default function *tokenize(text : string) {
    const { length } = text

    let offset = 0
    let line = 0
    let column = 0

    function getCurrent() {
        if (offset < length) return text[offset]
    }
    function move() {
        if (offset >= length) throw new Error // @todo

        const previous = getCurrent()

        ++offset
        ++column

        if (previous === '\n') {
            ++line

            column = 0
        }

        const current = getCurrent()

        return current
    }
    function location() {
        return new Location({ offset, line, column })
    }
    function skipLine() {
        while (offset < length) {
            const x = move()

            if (x === '\n') return x
        }
    }
    function skipWhitespace() {
        while (offset < length) {
            const x = getCurrent()

            switch (x) {
                case ';':
                    if (skipLine() === undefined) return
                case ' ':
                case '\n':
                case '\r':
                case '\t':
                    break
                default:
                    return x
            }

            move()
        }
    }
    function skip1<Token>(Token : new ({ begin, end } : { begin : Location, end : Location }) => Token) {
        const begin = location()

        move()

        const end = location()

        return new Token({ begin, end })
    }
    function skipWord() {
        while (offset < length) {
            const x = getCurrent()

            switch (x) {
                case undefined:
                case ' ':
                case '\n':
                case '\r':
                case '\t':
                case ',':
                case ':':
                case '\'':
                case '`':
                case '"':
                    return x
            }

            move()
        }
    }
    function scanWord(words : Array<string> = []) : Array<string> {
        const start = offset

        skipWord()

        words.push(text.substring(start, offset))

        const x = skipWhitespace()

        switch (x) {
            case undefined:
            case '(':
            case ')':
            case '[':
            case ']':
            case '{':
            case '}':
            case ',':
            case ':':
                return words
            // safety check
            case ';':
            case ' ':
            case '\n':
            case '\r':
            case '\t':
                throw new Error // @todo
            // not implemented
            case '\'':
            case '`':
            case '"':
                throw new Error // @todo
            default:
                return scanWord(words)
        }
    }

    while (true) {
        const x = skipWhitespace()

        switch (x) {
            // safety check
            case ';':
            case ' ':
            case '\n':
            case '\r':
            case '\t': throw new Error // @todo
            // end of scanning
            case undefined: return
            // check for tokens
            case ',': yield skip1(Comma); break
            case ':': yield skip1(Colon); break
            case '(': yield skip1(RoundOpening); break
            case ')': yield skip1(RoundClosing); break
            case '[': yield skip1(SquareOpening); break
            case ']': yield skip1(SquareClosing); break
            case '{': yield skip1(CurlyOpening); break
            case '}': yield skip1(CurlyClosing); break
            case '\'':
            case '`':
            case '"': throw new Error // @todo
            default:
                const begin = location()
                const value = scanWord().join(' ')
                const end = location()

                yield new Identifier({ value, begin, end })
        }
    }
}
