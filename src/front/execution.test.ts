import Execution from "./execution"
import Name from "./name"
import Parameter from "./parameter"
import Reference from "./reference"

it('should stringify without inputs and outputs', () => {
    const execution = new Execution({
        target : new Reference({ name : Name.From('f'), target : Parameter.From('f') })
    })

    expect(execution.toString()).toBe('f()')
})
