import Parser from "./parser";

const BIG_NUMBER = 100_000;

it(`should be function`, () => {
    expect(typeof Parser).toBe(`function`);
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

it(`should pass ${BIG_NUMBER} parameters`, () => {
    let source = `f(x`;

    for (let i = 0; i < BIG_NUMBER - 1; ++i) {
        source += `,x`;
    }

    source += `){}`;

    const parser = new Parser;

    expect(() => parser.Parse(source)).not.toThrow();
});

it(`should pass ${BIG_NUMBER} declaration`, () => {
    let source = ``;

    for (let i = 0; i < BIG_NUMBER; ++i) {
        source += `f(){}`;
    }

    const parser = new Parser;

    expect(() => parser.Parse(source)).not.toThrow();
});

it(`should pass ${BIG_NUMBER} nested declaration`, () => {
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
