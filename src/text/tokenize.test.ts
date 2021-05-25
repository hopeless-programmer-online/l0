import { Colon, Comma, CurlyClosing, CurlyOpening, Identifier, RoundClosing, RoundOpening, SquareClosing, SquareOpening } from '../text'
import tokenize from './tokenize'

const type = Symbol()

Object.defineProperty(Comment.prototype, type, { value : 'comment' })
Object.defineProperty(Comma.prototype, type, { value : ',' })
Object.defineProperty(Colon.prototype, type, { value : ':' })
Object.defineProperty(RoundOpening.prototype, type, { value : '(' })
Object.defineProperty(RoundClosing.prototype, type, { value : ')' })
Object.defineProperty(SquareOpening.prototype, type, { value : '[' })
Object.defineProperty(SquareClosing.prototype, type, { value : ']' })
Object.defineProperty(CurlyOpening.prototype, type, { value : '{' })
Object.defineProperty(CurlyClosing.prototype, type, { value : '}' })
Object.defineProperty(Identifier.prototype, type, { value : 'identifier' })

it('should pass on empty string', () => {
    expect([ ...tokenize('') ]).toEqual([])
})
it('should skip comments', () => {
    expect([ ...tokenize('; ()[]{},:;\n') ]).toMatchObject([
        { [type] : 'comment', text : '; ()[]{},:;', begin : { offset : 0, line : 0, column : 0 }, end : { offset : 11, line : 0, column : 11 } },
    ])
})
it('should skip comments without newline', () => {
    expect([ ...tokenize('; ()[]{},:;') ]).toEqual([])
})
it('should parse after comment', () => {
    expect([ ...tokenize('; ()[]{},:;\n,') ]).toMatchObject([
        { [type] : 'comment', text : '; ()[]{},:;', begin : { offset : 0, line : 0, column : 0 }, end : { offset : 11, line : 0, column : 11 } },
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
it('should parse letters, number and special characters', () => {
    expect([ ...tokenize('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789~!@#$%^&*-=_+\\|/<>?') ]).toMatchObject([
        {
            [type] : 'identifier',
            value : 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789~!@#$%^&*-=_+\\|/<>?',
            begin : { offset : 0, line : 0, column : 0 },
            end : { offset : 81, line : 0, column : 81 },
        },
    ])
})
it('should parse space separated words', () => {
    expect([ ...tokenize('x y z') ]).toMatchObject([
        {
            [type] : 'identifier',
            value : 'x y z',
            begin : { offset : 0, line : 0, column : 0 },
            end : { offset : 5, line : 0, column : 5 },
        },
    ])
})
it('should parse word before comma', () => {
    expect([ ...tokenize('x,') ]).toMatchObject([
        {
            [type] : 'identifier',
            value : 'x',
            begin : { offset : 0, line : 0, column : 0 },
            end : { offset : 1, line : 0, column : 1 },
        },
        {
            [type] : ',',
            begin : { offset : 1, line : 0, column : 1 },
            end : { offset : 2, line : 0, column : 2 },
        },
    ])
})
it('should parse word before colon', () => {
    expect([ ...tokenize('x:') ]).toMatchObject([
        {
            [type] : 'identifier',
            value : 'x',
            begin : { offset : 0, line : 0, column : 0 },
            end : { offset : 1, line : 0, column : 1 },
        },
        {
            [type] : ':',
            begin : { offset : 1, line : 0, column : 1 },
            end : { offset : 2, line : 0, column : 2 },
        },
    ])
})
it('should parse word before brace', () => {
    expect([ ...tokenize('x(') ]).toMatchObject([
        {
            [type] : 'identifier',
            value : 'x',
            begin : { offset : 0, line : 0, column : 0 },
            end : { offset : 1, line : 0, column : 1 },
        },
        {
            [type] : '(',
            begin : { offset : 1, line : 0, column : 1 },
            end : { offset : 2, line : 0, column : 2 },
        },
    ])
})
it('should parse string', () => {
    expect([ ...tokenize('"xyz"') ]).toMatchObject([
        {
            [type] : 'identifier',
            value : '"xyz"',
            begin : { offset : 0, line : 0, column : 0 },
            end : { offset : 5, line : 0, column : 5 },
        },
    ])
})
it('should parse two strings', () => {
    expect([ ...tokenize('"xyz" "uvw"') ]).toMatchObject([
        {
            [type] : 'identifier',
            value : '"xyz" "uvw"',
            begin : { offset : 0, line : 0, column : 0 },
            end : { offset : 11, line : 0, column : 11 },
        },
    ])
})
it('should parse mixed identifier', () => {
    expect([ ...tokenize('xyz "uvw"') ]).toMatchObject([
        {
            [type] : 'identifier',
            value : 'xyz "uvw"',
            begin : { offset : 0, line : 0, column : 0 },
            end : { offset : 9, line : 0, column : 9 },
        },
    ])
})
it('should parse mixed identifier (string first)', () => {
    expect([ ...tokenize('"xyz" uvw') ]).toMatchObject([
        {
            [type] : 'identifier',
            value : '"xyz" uvw',
            begin : { offset : 0, line : 0, column : 0 },
            end : { offset : 9, line : 0, column : 9 },
        },
    ])
})
