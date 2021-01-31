import Execution from './execution'
import ExplicitOutput from './explicit-output'
import ExplicitParameter from './explicit-parameter'
import Inputs from './inputs'
import Name from './name'
import Output from './output'
import Outputs from './outputs'
import Reference from './reference'

function param(text : string) {
    return new Reference({ name : Name.From(text), target : ExplicitParameter.From(text) })
}
function output(text : string) {
    return new ExplicitOutput({ name : Name.From(text) })
}

it('should stringify without inputs and outputs', () => {
    const execution = new Execution({
        target : param('f')
    })

    expect(execution.toString()).toBe('f()')
})
it('should stringify with single input', () => {
    const execution = new Execution({
        target : param('f'),
        inputs : new Inputs({ array : [
            param('x'),
        ] }),
    })

    expect(execution.toString()).toBe('f(x)')
})
it('should stringify with two inputs', () => {
    const execution = new Execution({
        target : param('f'),
        inputs : new Inputs({ array : [
            param('x'),
            param('y'),
        ] }),
    })

    expect(execution.toString()).toBe('f(x, y)')
})
it('should stringify with three inputs', () => {
    const execution = new Execution({
        target : param('f'),
        inputs : new Inputs({ array : [
            param('x'),
            param('y'),
            param('z'),
        ] }),
    })

    expect(execution.toString()).toBe('f(x, y, z)')
})
it('should stringify with single output', () => {
    const execution = new Execution({
        target : param('f'),
        outputs : new Outputs({ array : [
            output('u'),
        ] }),
    })

    expect(execution.toString()).toBe('u : f()')
})
it('should stringify with two outputs', () => {
    const execution = new Execution({
        target : param('f'),
        outputs : Outputs.From('u', 'v'),
    })

    expect(execution.toString()).toBe('u, v : f()')
})
it('should stringify with three outputs', () => {
    const execution = new Execution({
        target : param('f'),
        outputs : new Outputs({ array : [
            output('u'),
            output('v'),
            output('w'),
        ] }),
    })

    expect(execution.toString()).toBe('u, v, w : f()')
})
it('should stringify with three inputs and outputs', () => {
    const execution = new Execution({
        target : param('f'),
        inputs : new Inputs({ array : [
            param('x'),
            param('y'),
            param('z'),
        ] }),
        outputs : Outputs.From('u', 'v', 'w'),
    })

    expect(execution.toString()).toBe('u, v, w : f(x, y, z)')
})
