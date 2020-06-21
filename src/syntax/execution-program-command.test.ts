import Execution from "./execution-program-command";
import Variable from "./variable";
import Reference from "./reference";
import Inputs from "./execution-program-command-inputs";
import Outputs from "./execution-program-command-outputs";
import ExplicitInput from "./explicit-execution-program-command-input";
import ExplicitOutput from "./explicit-execution-program-command-output";

it(`should stringify`, () => {
    const command = new Execution({
        Outputs : new Outputs(
            new ExplicitOutput({
                Variable : new Variable({
                    Name : `u`,
                }),
                Index : 0,
            }),
            new ExplicitOutput({
                Variable : new Variable({
                    Name : `v`,
                }),
                Index : 1,
            }),
            new ExplicitOutput({
                Variable : new Variable({
                    Name : `w`,
                }),
                Index : 2,
            }),
        ),
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

    expect(command.toString()).toBe(`u, v, w : f(x, y, z)`);
});
