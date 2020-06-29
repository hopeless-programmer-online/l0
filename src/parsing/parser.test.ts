import Parser from "./parser";

it(`should be function`, () => {
    expect(typeof Parser).toBe(`function`);
});

it(`should parse empty string`, () => {
    const parser = new Parser;
    const program = parser.Parse(`f() {}`);

    expect(program.toString()).toBe(
        `() {\n` +
        `\tf () {\n` +
        `\t}\n` +
        `}`,
    );
});
