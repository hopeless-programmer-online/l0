import Commands from './commands'

it('should stringify without commands', () => {
    expect((new Commands).toString()).toBe('')
})
