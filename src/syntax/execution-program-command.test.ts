import Execution from "./execution-program-command";
import Variable from "./variable";
import Reference from "./reference";
import Inputs from "./execution-program-command-inputs";
import ExplicitInput from "./explicit-execution-program-command-input";

it(`should stringify`, () => {
    const command = new Execution({
        Program : new Reference({
            Variable : new Variable({
                Name : `f`,
            }),
            Name : `f`,
        }),
        Inputs : new Inputs(
            new ExplicitInput({
                Reference : new Reference({
                    Variable : new Variable({
                        Name : `x`,
                    }),
                    Name : `x`,
                }),
                Index : 0,
            }),
            new ExplicitInput({
                Reference : new Reference({
                    Variable : new Variable({
                        Name : `y`,
                    }),
                    Name : `y`,
                }),
                Index : 1,
            }),
            new ExplicitInput({
                Reference : new Reference({
                    Variable : new Variable({
                        Name : `z`,
                    }),
                    Name : `z`,
                }),
                Index : 2,
            }),
        ),
    });

    expect(command.toString()).toBe(`f(x, y, z)`);
});
