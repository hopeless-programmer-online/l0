import Program from "./program";
import Parameters from "./program-parameters";
import Explicit from "./explicit-program-parameter";
import Variable from "./variable";

it(`should stringify`, () => {
    const program = new Program({
        Parameters : new Parameters(
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
        ),
    });

    expect(program.toString()).toBe(
        `(x, y, z) {\n` +
        `}`,
    );
});
