import Tokens from "../tokening/tokens";
import Parser from "./parser";

function parse(text : string, globals : Array<string> = []) {
    const tokens = Tokens.FromString(text);
    const parser = new Parser;

    const program = parser.Parse(tokens, globals);

    return `${program}`;
}

it(``, () => {
    expect(parse(
        `f() {\n` +
        `}` +
        `f(x) {\n` +
        `}` +
        `f(x, x) {\n` +
        `}` +
        `f(x, x, x) {\n` +
        `}` +
        `f()\n` +
        `f(f)\n` +
        `f(f, f)\n` +
        `f(f, f, f)\n` +
        `u : f()\n` +
        `u : f(f)\n` +
        `u : f(f, f)\n` +
        `u : f(f, f, f)\n` +
        `u, u : f()\n` +
        `u, u : f(f)\n` +
        `u, u : f(f, f)\n` +
        `u, u : f(f, f, f)\n` +
        `u, u, u : f()\n` +
        `u, u, u : f(f)\n` +
        `u, u, u : f(f, f)\n` +
        `u, u, u : f(f, f, f)\n` +
    ``)).toBe(
        `() {\n` +
        `\tf () {\n` +
        `\t}\n` +
        `\tf (x) {\n` +
        `\t}\n` +
        `\tf (x, x) {\n` +
        `\t}\n` +
        `\tf (x, x, x) {\n` +
        `\t}\n` +
        `\tf()\n` +
        `\tf(f)\n` +
        `\tf(f, f)\n` +
        `\tf(f, f, f)\n` +
        `\tu : f()\n` +
        `\tu : f(f)\n` +
        `\tu : f(f, f)\n` +
        `\tu : f(f, f, f)\n` +
        `\tu, u : f()\n` +
        `\tu, u : f(f)\n` +
        `\tu, u : f(f, f)\n` +
        `\tu, u : f(f, f, f)\n` +
        `\tu, u, u : f()\n` +
        `\tu, u, u : f(f)\n` +
        `\tu, u, u : f(f, f)\n` +
        `\tu, u, u : f(f, f, f)\n` +
        `}` +
    ``);
});

it(``, () => {
    expect(parse(
        `print()\n` +
    ``, [ `print` ])).toBe(
        `(print) {\n` +
        `\tprint()\n` +
        `}` +
    ``);
});

it(``, () => {
    expect(parse(
        `f(x) {\n` +
        `\tg() {\n` +
        `\t\tx()\n` +
        `\t}\n` +
        `}\n` +
    ``)).toBe(
        `() {\n` +
        `\tf (x) {\n` +
        `\t\tg () {\n` +
        `\t\t\tx()\n` +
        `\t\t}\n` +
        `\t}\n` +
        `}` +
    ``);
});

it(``, () => {
    expect(parse(
        `f() {\n` +
        `\tf()\n` +
        `}\n` +
    ``)).toBe(
        `() {\n` +
        `\tf () {\n` +
        `\t\tf()\n` +
        `\t}\n` +
        `}` +
    ``);
});

it(``, () => {
    expect(parse(
        `f() {\n` +
        `\tf() {\n` +
        `\t\t/super()\n` +
        `\t}\n` +
        `}\n` +
    ``)).toBe(
        `() {\n` +
        `\tf () {\n` +
        `\t\tf () {\n` +
        `\t\t\t/super()\n` +
        `\t\t}\n` +
        `\t}\n` +
        `}` +
    ``);
});

it(``, () => {
    expect(parse(
        `f()` +
    ``)).toBe(
        `(f) {\n` +
        `\tf()\n` +
        `}` +
    ``);
});

it(``, () => {
    expect(parse(
        `print(true)` +
    ``)).toBe(
        `(print, true) {\n` +
        `\tprint(true)\n` +
        `}` +
    ``);
});
