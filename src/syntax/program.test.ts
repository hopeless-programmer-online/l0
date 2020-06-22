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
            Name : `x`,
        }),
        Index : 0,
    });
    const f = new Variable({
        Name : `f`,
    });
    const program = new Program({
        Parameters : new Parameters(
            x,
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
            new Implicit({
                Variable : new Variable({
                    Name : `w`,
                }),
            }),
        ),
        Commands : new Commands(
            new Declaration({
                Variable : f,
                Program  : new Program,
            }),
            new Execution({
                Program : new Reference({
                    Variable : x.Variable,
                    Name     : `x`,
                }),
            }),
        ),
    });

    expect(program.toString()).toBe(
        `(x, y, z) {\n` +
        `\tf () {\n` +
        `\t}\n` +
        `\tx()\n` +
        `}`,
    );
});
