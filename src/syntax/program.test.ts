import Name from "./name";
import Program from "./program";
import Parameters from "./program-parameters";
import Commands from "./program-commands";
import Explicit from "./explicit-program-parameter";
import Implicit from "./implicit-program-parameter";
import Variable from "./variable";
import Execution from "./execution-program-command";
import Declaration from "./declaration-program-command";
import Reference from "./reference";

it(`should stringify`, () => {
    const x = new Explicit({
        Variable : new Variable({
            Name : new Name({ String : `x` }),
        }),
        Index : 0,
    });
    const f = new Variable({
        Name : new Name({ String : `f` }),
    });
    const program = new Program({
        Parameters : new Parameters(...[
            x,
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
            new Implicit({
                Variable : new Variable({
                    Name : new Name({ String : `w` }),
                }),
            }),
        ]),
        Commands : new Commands(...[
            new Declaration({
                Variable : f,
                Program  : new Program,
            }),
            new Execution({
                Program : new Reference({
                    Variable : f,
                    Name     : new Name({ String : `f` }),
                }),
            }),
        ]),
    });

    expect(program.toString()).toBe(
        `(x, y, z) {\n` +
        `\tf () {\n` +
        `\t}\n` +
        `\tf()\n` +
        `}`,
    );
});
