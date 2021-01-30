import { Colon, Comma, CurlyClosing, CurlyOpening, RoundClosing, RoundOpening, SquareClosing, SquareOpening } from '../text'
import tokenize from './tokenize'

const type = Symbol()

Object.defineProperty(Comma.prototype, type, { value : ',' })
Object.defineProperty(Colon.prototype, type, { value : ':' })
Object.defineProperty(RoundOpening.prototype, type, { value : '(' })
Object.defineProperty(RoundClosing.prototype, type, { value : ')' })
Object.defineProperty(SquareOpening.prototype, type, { value : '[' })
Object.defineProperty(SquareClosing.prototype, type, { value : ']' })
Object.defineProperty(CurlyOpening.prototype, type, { value : '{' })
Object.defineProperty(CurlyClosing.prototype, type, { value : '}' })

it('should pass on empty string', () => {
    expect([ ...tokenize('') ]).toEqual([])
})
it('should skip comments', () => {
    expect([ ...tokenize('; ()[]{},:;\n') ]).toEqual([])
})
it('should skip comments without newline', () => {
    expect([ ...tokenize('; ()[]{},:;') ]).toEqual([])
})
it('should parse after comment', () => {
    expect([ ...tokenize('; ()[]{},:;\n,') ]).toMatchObject([
        { [type] : ',', begin : { offset : 12, line : 1, column : 0 }, end : { offset : 13, line : 1, column : 1 } },
    ])
})
it('should parse comma', () => {
    expect([ ...tokenize(',') ]).toMatchObject([
        { [type] : ',', begin : { offset : 0, line : 0, column : 0 }, end : { offset : 1, line : 0, column : 1 } },
    ])
})
it('should parse colon', () => {
    expect([ ...tokenize(':') ]).toMatchObject([
        { [type] : ':', begin : { offset : 0, line : 0, column : 0 }, end : { offset : 1, line : 0, column : 1 } },
    ])
})
it('should parse comma', () => {
    expect([ ...tokenize(',') ]).toMatchObject([
        { [type] : ',', begin : { offset : 0, line : 0, column : 0 }, end : { offset : 1, line : 0, column : 1 } },
    ])
})
it('should parse round opening', () => {
    expect([ ...tokenize('(') ]).toMatchObject([
        { [type] : '(', begin : { offset : 0, line : 0, column : 0 }, end : { offset : 1, line : 0, column : 1 } },
    ])
})
it('should parse round closing', () => {
    expect([ ...tokenize(')') ]).toMatchObject([
        { [type] : ')', begin : { offset : 0, line : 0, column : 0 }, end : { offset : 1, line : 0, column : 1 } },
    ])
})
it('should parse square opening', () => {
    expect([ ...tokenize('[') ]).toMatchObject([
        { [type] : '[', begin : { offset : 0, line : 0, column : 0 }, end : { offset : 1, line : 0, column : 1 } },
    ])
})
it('should parse square closing', () => {
    expect([ ...tokenize(']') ]).toMatchObject([
        { [type] : ']', begin : { offset : 0, line : 0, column : 0 }, end : { offset : 1, line : 0, column : 1 } },
    ])
})
it('should parse curly opening', () => {
    expect([ ...tokenize('{') ]).toMatchObject([
        { [type] : '{', begin : { offset : 0, line : 0, column : 0 }, end : { offset : 1, line : 0, column : 1 } },
    ])
})
it('should parse curly closing', () => {
    expect([ ...tokenize('}') ]).toMatchObject([
        { [type] : '}', begin : { offset : 0, line : 0, column : 0 }, end : { offset : 1, line : 0, column : 1 } },
    ])
})
