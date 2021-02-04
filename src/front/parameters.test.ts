import Parameters from './parameters'

it('should stringify empty parameters', () => {
    expect(Parameters.from().toString()).toBe('')
})
it('should stringify single parameter', () => {
    expect(Parameters.from('x').toString()).toBe('x')
})
it('should stringify two parameters', () => {
    expect(Parameters.from('x', 'y').toString()).toBe('x, y')
})
it('should stringify three parameters', () => {
    expect(Parameters.from('x', 'y', 'z').toString()).toBe('x, y, z')
})
