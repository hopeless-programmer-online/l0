import { Comment, Colon, Comma, CurlyClosing, CurlyOpening, Identifier, Location, RoundClosing, RoundOpening, SquareClosing, SquareOpening, Word, PlainWord, QuotedWord } from '../text'
import Token from './token'

type Quote = '\'' | '"' | '`'

export default function *tokenize(text : string) : Generator<Token, void> {
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
    function *skipWhitespace() : Generator<Token, string | undefined> {
        while (offset < length) {
            const x = getCurrent()

            switch (x) {
                case ';':
                    const begin = location()

                    while (true) {
                        if (offset >= length) return

                        const x = move()

                        if (x === '\n') {
                            const end = location()

                            yield new Comment({ text : text.substring(begin.offset, end.offset), begin, end })

                            break
                        }
                    }
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
    function skip<Token>(Token : new ({ begin, end } : { begin : Location, end : Location }) => Token) {
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
                case '(':
                case ')':
                case '[':
                case ']':
                case '{':
                case '}':
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
    function skipString(opening : Quote) {
        while (offset < length) {
            const x = getCurrent()

            switch (x) {
                case undefined:
                    throw new Error // @todo
                case '\\': {
                    const x = move()

                    switch (x) {
                        case 't':
                        case 'n':
                        case 'r':
                        case '\\':
                        case '\'':
                        case '"':
                        case '`':
                            break
                        default:
                            throw new Error // @todo
                    }
                } break
                case '\'':
                case '`':
                case '"':
                    return x
            }

            move()
        }
    }
    function *scanWord(words : Array<Word> = []) : Generator<Token, Array<Word>> {
        const begin = location()

        skipWord()

        const end = location()

        words.push(new PlainWord({
            text : text.substring(begin.offset, end.offset),
            begin,
            end,
        }))

        const x = yield * skipWhitespace()

        switch (x) {
            // safety check
            case ';':
            case ' ':
            case '\n':
            case '\r':
            case '\t':
                throw new Error // @todo
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
            case '\'':
            case '`':
            case '"':
                return yield * scanString(x, words)
            default:
                return yield * scanWord(words)
        }
    }
    function *scanString(opening : Quote, words : Array<Word> = []) : Generator<Token, Array<Word>> {
        const begin = location()

        move()
        skipString(opening)
        move()

        const end = location()

        words.push(new QuotedWord({
            text : text.substring(begin.offset, end.offset),
            begin,
            end,
        }))

        const x = yield * skipWhitespace()

        switch (x) {
            // safety check
            case ';':
            case ' ':
            case '\n':
            case '\r':
            case '\t':
                throw new Error // @todo
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
            case '\'':
            case '`':
            case '"':
                return yield * scanString(x, words)
            default:
                return yield * scanWord(words)
        }
    }

    while (true) {
        const x = yield * skipWhitespace()

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
            case ',': yield skip(Comma); break
            case ':': yield skip(Colon); break
            case '(': yield skip(RoundOpening); break
            case ')': yield skip(RoundClosing); break
            case '[': yield skip(SquareOpening); break
            case ']': yield skip(SquareClosing); break
            case '{': yield skip(CurlyOpening); break
            case '}': yield skip(CurlyClosing); break
            case '\'':
            case '`':
            case '"': {
                const words = yield * scanString(x)

                yield new Identifier({ words })
            } break
            default: {
                const words = yield * scanWord()

                yield new Identifier({ words })
            }
        }
    }
}
