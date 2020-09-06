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
        `g() {\n` +
        `}` +
    ``)).toBe(
        `() {\n` +
        `\tf () {\n` +
        `\t}\n` +
        `\tg () {\n` +
        `\t}\n` +
        `}` +
    ``);
});
