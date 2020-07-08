import Parser from "./parser";

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
