import Tokens from "./tokens";
import NameToken from "./name-token";
import CommaToken from "./comma-token";
import ColonToken from "./colon-token";
import OpeningRoundBraceToken from "./opening-round-brace-token";
import ClosingRoundBraceToken from "./closing-round-brace-token";
import PlainWord from "./plain-word";

it(``, () => {
    const tokens = [ ...Tokens.FromString(`u, v : f(x, y)`) ];

    expect(tokens[0]).toBeInstanceOf(NameToken);

    const u = tokens[0] as NameToken;

    expect(u.Words).toHaveLength(1);
    expect(u.Words[0]).toBeInstanceOf(PlainWord);

    const u0 = u.Words[0] as PlainWord;

    expect(u0.Text).toBe(`u`);

    // expect(tokens[1]).toBeInstanceOf(CommaToken);

    // expect(tokens[2]).toBeInstanceOf(NameToken);
    // expect((tokens[2] as NameToken).String).toBe(`v`);

    // expect(tokens[3]).toBeInstanceOf(ColonToken);

    // expect(tokens[4]).toBeInstanceOf(NameToken);
    // expect((tokens[4] as NameToken).String).toBe(`f`);

    // expect(tokens[5]).toBeInstanceOf(OpeningRoundBraceToken);

    // expect(tokens[6]).toBeInstanceOf(NameToken);
    // expect((tokens[6] as NameToken).String).toBe(`x`);

    // expect(tokens[7]).toBeInstanceOf(CommaToken);

    // expect(tokens[8]).toBeInstanceOf(NameToken);
    // expect((tokens[8] as NameToken).String).toBe(`y`);

    // expect(tokens[9]).toBeInstanceOf(ClosingRoundBraceToken);
});
