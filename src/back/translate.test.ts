import { parse } from "../l0"
import translate from "./translate"

it('should translate empty string without errors', () => {
    expect(() => translate(parse(`
    `))).not.toThrow()
})
it('should translate declaration without errors', () => {
    expect(() => translate(parse(`
        f() {
        }
    `))).not.toThrow()
})
it('should translate execution without errors', () => {
    expect(() => translate(parse(`
        f()
    `))).not.toThrow()
})
