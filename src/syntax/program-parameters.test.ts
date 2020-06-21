import Parameters from "./program-parameters";
import Explicit from "./explicit-program-parameter";
import Variable from "./variable";

it(`should stringify`, () => {
    const parameters = new Parameters(
        new Explicit({
            Variable : new Variable({
                Name : `x`,
            }),
            Index : 0,
        }),
        new Explicit({
            Variable : new Variable({
                Name : `y`,
            }),
            Index : 1,
        }),
        new Explicit({
            Variable : new Variable({
                Name : `z`,
            }),
            Index : 2,
        }),
    );

    expect(parameters.toString()).toBe(`x, y, z`);
});
