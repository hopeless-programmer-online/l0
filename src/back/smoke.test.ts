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

    // while (!machine.Done) {
    //     console.log(util.inspect(machine.Buffer, { depth : null }));
    //     // console.log(`buffer: `, machine.Buffer);
    //     machine.Step();
    // }
    // for (let i = 0; i < 10; ++i) {
    //     console.log(util.inspect(machine.Buffer, { depth : null }));
    //     machine.Step();
    // }

    machine.Step(); // bootstrap main
    machine.Step(); // pass control to the first instruction
    machine.Step(); // pass control to the super
    machine.Step(); // execute super - reach terminator

    expect(machine.Done).toBe(true);
});

it(``, () => {
    // () {
    //   f() {
    //   }
    // }
    const program = new Program;

    program.Commands.Declare(`f`);

    const instruction = Instruction.From(program);

    // console.log(instruction);

    const machine = new Machine({
        Buffer : [ instruction ],
    });

    // for (let i = 0; i < 10; ++i) {
    //     console.log(util.inspect(machine.Buffer, { depth : null }));
    //     machine.Step();
    // }
    // while (!machine.Done) {
    //     console.log(util.inspect(machine.Buffer, { depth : null }));
    //     // console.log(`buffer: `, machine.Buffer);
    //     machine.Step();
    // }

    machine.Step(); // bootstrap main
    machine.Step(); // pass control to the first instruction (declaration)
    machine.Step(); // put program at the back of the buffer
    machine.Step(); // pass control to the super
    machine.Step(); // execute super - reach terminator

    expect(machine.Done).toBe(true);
});

it(``, () => {
    // () {
    //   f() {
    //   }
    //   g() {
    //   }
    // }
    const program = new Program;

    program.Commands.Declare(`f`);
    program.Commands.Declare(`g`);

    const instruction = Instruction.From(program);

    // console.log(instruction);

    const machine = new Machine({
        Buffer : [ instruction ],
    });

    // for (let i = 0; i < 10; ++i) {
    //     console.log(util.inspect(machine.Buffer, { depth : null }));
    //     machine.Step();
    // }
    // while (!machine.Done) {
    //     console.log(util.inspect(machine.Buffer, { depth : null }));
    //     // console.log(`buffer: `, machine.Buffer);
    //     machine.Step();
    // }

    machine.Step(); // bootstrap main
    machine.Step(); // pass control to the first instruction (declaration)
    machine.Step(); // put program (f) at the back of the buffer
    machine.Step(); // put program (g) at the back of the buffer
    machine.Step(); // pass control to the super
    machine.Step(); // execute super - reach terminator

    expect(machine.Done).toBe(true);
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

    const machine = new Machine({
        Buffer : [ instruction ],
    });

    // for (let i = 0; i < 10; ++i) {
    //     console.log(util.inspect(machine.Buffer, { depth : null }));
    //     machine.Step();
    // }
    // while (!machine.Done) {
    //     console.log(util.inspect(machine.Buffer, { depth : null }));
    //     // console.log(`buffer: `, machine.Buffer);
    //     machine.Step();
    // }

    machine.Step(); // bootstrap main
    machine.Step(); // pass control to the first instruction (declaration)
    machine.Step(); // put program (f) at the back of the buffer
    machine.Step(); // pass control to f
    machine.Step(); // restore saved context
    machine.Step(); // f passes control to the super
    machine.Step(); // restore saved context
    machine.Step(); // pass control to the super
    machine.Step(); // execute super - reach terminator

    expect(machine.Done).toBe(true);
});

/*it(``, () => {
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
