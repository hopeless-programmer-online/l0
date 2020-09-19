import Tokens from "./tokens";
import NameToken from "./name-token";
import CommaToken from "./comma-token";
import ColonToken from "./colon-token";
import OpeningRoundBraceToken from "./opening-round-brace-token";
import ClosingRoundBraceToken from "./closing-round-brace-token";
import PlainWord from "./plain-word";

it(``, () => {
    const tokens = [ ...Tokens.FromString(`u, v : f(x, y)`) ];

    // u
    expect(tokens[0]).toBeInstanceOf(NameToken);

    const u = tokens[0] as NameToken;

    expect(u.Words).toHaveLength(1);
    expect(u.Words[0]).toBeInstanceOf(PlainWord);

    const u0 = u.Words[0] as PlainWord;

    expect(u0.Text).toBe(`u`);

    // ,
    expect(tokens[1]).toBeInstanceOf(CommaToken);

    // v
    expect(tokens[2]).toBeInstanceOf(NameToken);

    const v = tokens[2] as NameToken;

    expect(v.Words).toHaveLength(1);
    expect(v.Words[0]).toBeInstanceOf(PlainWord);

    const v0 = v.Words[0] as PlainWord;

    expect(v0.Text).toBe(`v`);

    // :
    expect(tokens[3]).toBeInstanceOf(ColonToken);

    // f
    expect(tokens[4]).toBeInstanceOf(NameToken);

    const f = tokens[4] as NameToken;

    expect(f.Words).toHaveLength(1);
    expect(f.Words[0]).toBeInstanceOf(PlainWord);

    const f0 = f.Words[0] as PlainWord;

    expect(f0.Text).toBe(`f`);

    // (
    expect(tokens[5]).toBeInstanceOf(OpeningRoundBraceToken);

    // x
    expect(tokens[6]).toBeInstanceOf(NameToken);

    const x = tokens[6] as NameToken;

    expect(x.Words).toHaveLength(1);
    expect(x.Words[0]).toBeInstanceOf(PlainWord);

    const x0 = x.Words[0] as PlainWord;

    expect(x0.Text).toBe(`x`);

    // ,
    expect(tokens[7]).toBeInstanceOf(CommaToken);

    // y
    expect(tokens[8]).toBeInstanceOf(NameToken);

    const y = tokens[8] as NameToken;

    expect(y.Words).toHaveLength(1);
    expect(y.Words[0]).toBeInstanceOf(PlainWord);

    const y0 = y.Words[0] as PlainWord;

    expect(y0.Text).toBe(`y`);

    // )
    expect(tokens[9]).toBeInstanceOf(ClosingRoundBraceToken);
});

it(``, () => {
    const tokens = [ ...Tokens.FromString(`lol kek`) ];

    expect(tokens[0]).toBeInstanceOf(NameToken);

    const name = tokens[0] as NameToken;
    const words = name.Words;

    expect(words).toHaveLength(2);
    expect(words[0]).toBeInstanceOf(PlainWord);

    const word0 = words[0] as PlainWord;

    expect(word0.Text).toBe(`lol`);
    expect(words[1]).toBeInstanceOf(PlainWord);

    const word1 = words[1] as PlainWord;

    expect(word1.Text).toBe(`kek`);
});
