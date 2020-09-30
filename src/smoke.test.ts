import util from "util";
import Tokens from "./tokening/tokens";
import Parser from "./parsing/parser";
import Machine from "./back/machine";
import ExternalInstruction from "./back/external-instruction";
import Instruction from "./back/instruction";

it(``, () => {
    const tokens = Tokens.FromString(`test()`);
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

it(``, () => {
    const tokens = Tokens.FromString(`f(){test()}f()`);

    // console.log(tokens);

    const parser = new Parser;
    const program = parser.Parse(tokens, [ `test` ]);

    // console.log(util.inspect(program.Commands.Array, { depth : 5 }));

    expect(program.Commands.Array.length).toBe(2);

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

    // while (!machine.Done) {
    //     console.log(util.inspect(machine.Buffer, { depth : null }));
    //     // console.log(`buffer: `, machine.Buffer);
    //     machine.Step();
    // }

    while(!machine.Done) machine.Step();

    expect(counter).toBe(1);
});

it(``, () => {
    const tokens = Tokens.FromString(`f(){g(){/super()}g()}f()test()`);

    // console.log(tokens);

    const parser = new Parser;
    const program = parser.Parse(tokens, [ `test` ]);

    // console.log(util.inspect(program.Commands.Array, { depth : 5 }));

    expect(program.Commands.Array.length).toBe(3);

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

    // while (!machine.Done) {
    //     console.log(util.inspect(machine.Buffer, { depth : null }));
    //     // console.log(`buffer: `, machine.Buffer);
    //     machine.Step();
    // }

    while(!machine.Done) machine.Step();

    expect(counter).toBe(1);
});
