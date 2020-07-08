import Name from "./name";
import Variable from "./variable";
import Reference from "./reference";
import Execution from "./execution-program-command";
import Inputs from "./execution-program-command-inputs";
import Outputs from "./execution-program-command-outputs";
import ExplicitInput from "./explicit-execution-program-command-input";
import ExplicitOutput from "./explicit-execution-program-command-output";

it(`should stringify`, () => {
    const command = new Execution({
        Outputs : new Outputs(
            new ExplicitOutput({
                Variable : new Variable({
                    Name : new Name({ String : `u` }),
                }),
                Index : 0,
            }),
            new ExplicitOutput({
                Variable : new Variable({
                    Name : new Name({ String : `v` }),
                }),
                Index : 1,
            }),
            new ExplicitOutput({
                Variable : new Variable({
                    Name : new Name({ String : `w` }),
                }),
                Index : 2,
            }),
        ),
        Program : new Reference({
            Variable : new Variable({
                Name : new Name({ String : `f` }),
            }),
            Name : new Name({ String : `f` }),
        }),
        Inputs : new Inputs(
            new ExplicitInput({
                Reference : new Reference({
                    Variable : new Variable({
                        Name : new Name({ String : `x` }),
                    }),
                    Name : new Name({ String : `x` }),
                }),
                Index : 0,
            }),
            new ExplicitInput({
                Reference : new Reference({
                    Variable : new Variable({
                        Name : new Name({ String : `y` }),
                    }),
                    Name : new Name({ String : `y` }),
                }),
                Index : 1,
            }),
            new ExplicitInput({
                Reference : new Reference({
                    Variable : new Variable({
                        Name : new Name({ String : `z` }),
                    }),
                    Name : new Name({ String : `z` }),
                }),
                Index : 2,
            }),
        ),
    });

    expect(command.toString()).toBe(`u, v, w : f(x, y, z)`);
});
