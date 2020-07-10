import Parser from "./parser";
import * as syntax from "../syntax";

const BIG_NUMBER = 1; // 1000; // 1_000_000;

it(`should be function`, () => {
    expect(typeof Parser).toBe(`function`);
});

it(`should parse word declaration`, () => {
    const parser = new Parser;
    const program = parser.Parse(`function name() {}`);

    expect(program.toString()).toBe(
        `() {\n` +
        `\tfunction name () {\n` +
        `\t}\n` +
        `}`,
    );
});

it(`should parse number declaration`, () => {
    const parser = new Parser;
    const program = parser.Parse(`1() {}`);

    expect(program.toString()).toBe(
        `() {\n` +
        `\t1 () {\n` +
        `\t}\n` +
        `}`,
    );
});

it(`should parse empty string`, () => {
    const parser = new Parser;
    const program = parser.Parse(``);

    expect(program.toString()).toBe(
        `() {\n` +
        `}`,
    );
});

it(`should parse declaration`, () => {
    const parser = new Parser;
    const program = parser.Parse(`f() {}`);

    expect(program.toString()).toBe(
        `() {\n` +
        `\tf () {\n` +
        `\t}\n` +
        `}`,
    );
});

it(`should parse pair of declarations`, () => {
    const parser = new Parser;
    const program = parser.Parse(`f() {} g() {}`);

    expect(program.toString()).toBe(
        `() {\n` +
        `\tf () {\n` +
        `\t}\n` +
        `\tg () {\n` +
        `\t}\n` +
        `}`,
    );
});

it(`should parse three declarations`, () => {
    const parser = new Parser;
    const program = parser.Parse(`f() {} g() {} h() {}`);

    expect(program.toString()).toBe(
        `() {\n` +
        `\tf () {\n` +
        `\t}\n` +
        `\tg () {\n` +
        `\t}\n` +
        `\th () {\n` +
        `\t}\n` +
        `}`,
    );
});

it(`should parse nested declaration`, () => {
    const parser = new Parser;
    const program = parser.Parse(`f() { g() {} }`);

    expect(program.toString()).toBe(
        `() {\n` +
        `\tf () {\n` +
        `\t\tg () {\n` +
        `\t\t}\n` +
        `\t}\n` +
        `}`,
    );
});

it(`should parse twice nested declaration`, () => {
    const parser = new Parser;
    const program = parser.Parse(`f() { g() { h() {} } }`);

    expect(program.toString()).toBe(
        `() {\n` +
        `\tf () {\n` +
        `\t\tg () {\n` +
        `\t\t\th () {\n` +
        `\t\t\t}\n` +
        `\t\t}\n` +
        `\t}\n` +
        `}`,
    );
});

it(`should parse single parameter`, () => {
    const parser = new Parser;
    const program = parser.Parse(`f(x) {}`);

    expect(program.toString()).toBe(
        `() {\n` +
        `\tf (x) {\n` +
        `\t}\n` +
        `}`,
    );
});

it(`should parse pair of parameters`, () => {
    const parser = new Parser;
    const program = parser.Parse(`f(x, y) {}`);

    expect(program.toString()).toBe(
        `() {\n` +
        `\tf (x, y) {\n` +
        `\t}\n` +
        `}`,
    );
});

it(`should parse three parameters`, () => {
    const parser = new Parser;
    const program = parser.Parse(`f(x, y, z) {}`);

    expect(program.toString()).toBe(
        `() {\n` +
        `\tf (x, y, z) {\n` +
        `\t}\n` +
        `}`,
    );
});

it(`should parse ${BIG_NUMBER} parameters`, () => {
    let source = `f(x`;

    for (let i = 0; i < BIG_NUMBER - 1; ++i) {
        source += `,x`;
    }

    source += `){}`;

    const parser = new Parser;

    expect(() => parser.Parse(source)).not.toThrow();
});

it(`should parse ${BIG_NUMBER} declarations`, () => {
    let source = ``;

    for (let i = 0; i < BIG_NUMBER; ++i) {
        source += `${i}(){}`;
    }

    const parser = new Parser;

    expect(() => parser.Parse(source)).not.toThrow();
});

it(`should parse ${BIG_NUMBER} nested declaration`, () => {
    let source = ``;

    for (let i = 0; i < BIG_NUMBER; ++i) {
        source += `f(){`;
    }
    for (let i = 0; i < BIG_NUMBER; ++i) {
        source += `}`;
    }

    const parser = new Parser;

    expect(() => parser.Parse(source)).not.toThrow();
});

it(`should parse execution`, () => {
    const parser = new Parser;
    const program = parser.Parse(`f() {} f()`);

    expect(program.toString()).toBe(
        `() {\n` +
        `\tf () {\n` +
        `\t}\n` +
        `\tf()\n` +
        `}`,
    );
});

it(`should parse pair of executions`, () => {
    const parser = new Parser;
    const program = parser.Parse(`f() {} f() f()`);

    expect(program.toString()).toBe(
        `() {\n` +
        `\tf () {\n` +
        `\t}\n` +
        `\tf()\n` +
        `\tf()\n` +
        `}`,
    );
});

it(`should parse three executions`, () => {
    const parser = new Parser;
    const program = parser.Parse(`f() {} f() f() f()`);

    expect(program.toString()).toBe(
        `() {\n` +
        `\tf () {\n` +
        `\t}\n` +
        `\tf()\n` +
        `\tf()\n` +
        `\tf()\n` +
        `}`,
    );
});

it(`should parse execution inside declaration`, () => {
    const parser = new Parser;
    const program = parser.Parse(`f() { f() }`);

    expect(program.toString()).toBe(
        `() {\n` +
        `\tf () {\n` +
        `\t\tf()\n` +
        `\t}\n` +
        `}`,
    );
});

it(`should parse pair of executions inside declaration`, () => {
    const parser = new Parser;
    const program = parser.Parse(`f() { f() f() }`);

    expect(program.toString()).toBe(
        `() {\n` +
        `\tf () {\n` +
        `\t\tf()\n` +
        `\t\tf()\n` +
        `\t}\n` +
        `}`,
    );
});

it(`should parse three executions inside declaration`, () => {
    const parser = new Parser;
    const program = parser.Parse(`f() { f() f() f() }`);

    expect(program.toString()).toBe(
        `() {\n` +
        `\tf () {\n` +
        `\t\tf()\n` +
        `\t\tf()\n` +
        `\t\tf()\n` +
        `\t}\n` +
        `}`,
    );
});

it(`should parse input`, () => {
    const parser = new Parser;
    const program = parser.Parse(`f() {} f(f)`);

    expect(program.toString()).toBe(
        `() {\n` +
        `\tf () {\n` +
        `\t}\n` +
        `\tf(f)\n` +
        `}`,
    );
});

it(`should parse pair of inputs`, () => {
    const parser = new Parser;
    const program = parser.Parse(`f() {} f(f, f)`);

    expect(program.toString()).toBe(
        `() {\n` +
        `\tf () {\n` +
        `\t}\n` +
        `\tf(f, f)\n` +
        `}`,
    );
});

it(`should parse three inputs`, () => {
    const parser = new Parser;
    const program = parser.Parse(`f() {} f(f, f, f)`);

    expect(program.toString()).toBe(
        `() {\n` +
        `\tf () {\n` +
        `\t}\n` +
        `\tf(f, f, f)\n` +
        `}`,
    );
});

it(`should parse ${BIG_NUMBER} inputs`, () => {
    let source = `f(){}f(f`;

    for (let i = 1; i < BIG_NUMBER; ++i) {
        source += `,f`;
    }

    source += `)`;

    const parser = new Parser;

    expect(() => parser.Parse(source)).not.toThrow();
});

it(`should parse output`, () => {
    const parser = new Parser;
    const program = parser.Parse(`f() {} u : f()`);

    expect(program.toString()).toBe(
        `() {\n` +
        `\tf () {\n` +
        `\t}\n` +
        `\tu : f()\n` +
        `}`,
    );
});

it(`should parse pair of outputs`, () => {
    const parser = new Parser;
    const program = parser.Parse(`f() {} u, u : f()`);

    expect(program.toString()).toBe(
        `() {\n` +
        `\tf () {\n` +
        `\t}\n` +
        `\tu, u : f()\n` +
        `}`,
    );
});

it(`should parse three outputs`, () => {
    const parser = new Parser;
    const program = parser.Parse(`f() {} u, u, u : f()`);

    expect(program.toString()).toBe(
        `() {\n` +
        `\tf () {\n` +
        `\t}\n` +
        `\tu, u, u : f()\n` +
        `}`,
    );
});

it(`should parse ${BIG_NUMBER} outputs`, () => {
    let source = `f(){}u`;

    for (let i = 1; i < BIG_NUMBER; ++i) {
        source += `,u`;
    }

    source += `:f()`;

    const parser = new Parser;

    expect(() => parser.Parse(source)).not.toThrow();
});

it(`should access output`, () => {
    const parser = new Parser;
    const program = parser.Parse(`f() {} u : f() u()`);

    expect(program.toString()).toBe(
        `() {\n` +
        `\tf () {\n` +
        `\t}\n` +
        `\tu : f()\n` +
        `\tu()\n` +
        `}`,
    );
});

it(`should access parameter`, () => {
    const parser = new Parser;
    const program = parser.Parse(`f(x) { x() }`);

    expect(program.toString()).toBe(
        `() {\n` +
        `\tf (x) {\n` +
        `\t\tx()\n` +
        `\t}\n` +
        `}`,
    );
});

it(`should access overlapped declarations`, () => {
    const parser = new Parser;
    const program = parser.Parse(`f(){}f(){}../f()`);

    const declaration = program.Commands.Array[0];

    if (!(declaration instanceof syntax.DeclarationProgramCommand)) {
        throw new Error; // @todo
    }

    const execution = program.Commands.Array[2];

    if (!(execution instanceof syntax.ExecutionProgramCommand)) {
        throw new Error; // @todo
    }

    expect(execution.Program.Variable).toBe(declaration.Variable);
});

it(`should throw on not existing variable`, () => {
    expect(() => (new Parser).Parse(`f()`)).toThrowError();
});
