import Program from "../front/program";
import Instruction from "./instruction";
import Machine from "./machine";
import util from "util";

it(``, () => {
    // () {
    // }
    const program = new Program;
    const instruction = Instruction.From(program);

    // console.log(...instruction.Sources);

    const machine = new Machine({
        Buffer : [ instruction ],
    });

    for (let i = 0; i < 10; ++i) {
        console.log(util.inspect(machine.Buffer, { depth : null }));
        // console.log(`buffer: `, machine.Buffer);
        machine.Step();
    }

    // machine.Step();
    // machine.Step();

    // expect(machine.Done).toBe(true);
});

/*it(``, () => {
    // () {
    //   f() {
    //   }
    // }
    const program = new Program;

    program.Commands.Declare(`f`);

    const instruction = Instruction.From(program);

    // console.log(instruction);
});

it(``, () => {
    // () {
    //   f() {
    //   }
    //   f()
    // }
    const program = new Program;

    program.Commands.Declare(`f`);
    program.Commands.Execute(`f`);

    const instruction = Instruction.From(program);

    // console.log(instruction);
});

it(``, () => {
    // () {
    //   f() {
    //     g() {
    //     }
    //   }
    //   f()
    // }
    const program = new Program;

    const f = program.Commands.Declare(`f`);

    f.Program.Commands.Declare(`g`);

    program.Commands.Execute(`f`);

    const instruction = Instruction.From(program);

    // console.log(instruction);
});*/
