import Tokens from "./tokening/tokens";
import Parser from "./parsing/parser";
import Machine from "./back/machine";
import ExternalInstruction from "./back/external-instruction";
import Instruction from "./back/instruction";

it(``, () => {
    const tokens = new Tokens(`test()`);
    const parser = new Parser;
    const program = parser.Parse(tokens, [ `test` ]);

    // console.log(program);

    let counter = 0;

    function test(array : Array<any>) : Array<any> {
        ++counter;

        return [ array[1] ];
    }

    const instruction = Instruction.From(program, [
        new ExternalInstruction({ Callback : test }),
    ]);

    // console.log(instruction);

    const machine = new Machine({ Buffer : [ instruction ] });

    while(!machine.Done) machine.Step();

    expect(counter).toBe(1);
});
