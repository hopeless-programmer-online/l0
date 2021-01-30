import { Comma } from '../text'
import tokenize from './tokenize'

const type = Symbol()

Object.defineProperty(Comma.prototype, type, { value : ',' })

it('should pass on empty string', () => {
    expect([ ...tokenize('') ]).toEqual([])
})
it('should skip comments', () => {
    expect([ ...tokenize('; ()[]{},:;\n') ]).toEqual([])
})
it('should skip comments without newline', () => {
    expect([ ...tokenize('; ()[]{},:;') ]).toEqual([])
})
it('should parse comma', () => {
    expect([ ...tokenize(',') ]).toMatchObject([
        { [type] : ',', begin : { offset : 0, line : 0, column : 0 }, end : { offset : 1, line : 0, column : 1 } },
    ])
})
