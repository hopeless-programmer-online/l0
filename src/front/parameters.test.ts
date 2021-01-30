import Parameters from './parameters'

it('should stringify empty parameters', () => {
    expect(Parameters.From().toString()).toBe('')
})
it('should stringify single parameter', () => {
    expect(Parameters.From('x').toString()).toBe('x')
})
it('should stringify two parameters', () => {
    expect(Parameters.From('x', 'y').toString()).toBe('x, y')
})
it('should stringify three parameters', () => {
    expect(Parameters.From('x', 'y', 'z').toString()).toBe('x, y, z')
})
