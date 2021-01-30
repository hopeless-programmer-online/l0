import Parameters from "./parameters"

it('should stringify without parameters', () => {
    expect((new Parameters).toString()).toBe('')
})
