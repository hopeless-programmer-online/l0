import Execution from "./execution-program-command";
import Variable from "./variable";
import Reference from "./reference";

it(`should stringify`, () => {
    const command = new Execution({
        Program : new Reference({
            Variable : new Variable({
                Name : `f`,
            }),
            Name : `f`,
        }),
    });

    expect(command.toString()).toBe(`f()`);
});
