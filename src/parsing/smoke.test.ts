import Tokens from "../tokening/tokens";
import Parser from "./parser";

function parse(text : string) {
    const tokens = new Tokens(text);
    const parser = new Parser;

    const program = parser.Parse(tokens);

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
        `}` +
    ``);
});
