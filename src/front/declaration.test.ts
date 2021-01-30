import Declaration from "./declaration"
import Name from "./name"
import Program from "./program"

it('should stringify', () => {
    const declaration = new Declaration({
        name : new Name({ text : 'f' }),
        program : new Program,
    })

    expect(declaration.toString()).toBe(
        `f () {\n` +
        `}` +
    ``)
})
