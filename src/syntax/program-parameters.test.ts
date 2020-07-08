import Parameters from "./program-parameters";
import Explicit from "./explicit-program-parameter";
import Variable from "./variable";
import Name from "./name";

it(`should stringify`, () => {
    const parameters = new Parameters(
        new Explicit({
            Variable : new Variable({
                Name : new Name({ String : `x` }),
            }),
            Index : 0,
        }),
        new Explicit({
            Variable : new Variable({
                Name : new Name({ String : `y` }),
            }),
            Index : 1,
        }),
        new Explicit({
            Variable : new Variable({
                Name : new Name({ String : `z` }),
            }),
            Index : 2,
        }),
    );

    expect(parameters.toString()).toBe(`x, y, z`);
});
