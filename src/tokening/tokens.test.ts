import Tokens from "./tokens";
import NameToken from "./name-token";
import CommaToken from "./comma-token";
import ColonToken from "./colon-token";
import OpeningRoundBraceToken from "./opening-round-brace-token";
import ClosingRoundBraceToken from "./closing-round-brace-token";
import PlainWord from "./plain-word";
import QuotedWord from "./quoted-word";

it(``, () => {
    const tokens = [ ...Tokens.FromString(`u, v : f(x, y)`) ];

    // u
    expect(tokens[0]).toBeInstanceOf(NameToken);

    const u = tokens[0] as NameToken;

    expect(u.Name.Words).toHaveLength(1);
    expect(u.Name.Words[0]).toBeInstanceOf(PlainWord);

    const u0 = u.Name.Words[0] as PlainWord;

    expect(u0.Text).toBe(`u`);
    expect(u0.Begin.Offset).toBe(0);
    expect(u0.End.Offset).toBe(1);

    // ,
    expect(tokens[1]).toBeInstanceOf(CommaToken);

    const token1 = tokens[1] as CommaToken;

    expect(token1.Begin.Offset).toBe(1);
    expect(token1.End.Offset).toBe(2);

    // v
    expect(tokens[2]).toBeInstanceOf(NameToken);

    const v = tokens[2] as NameToken;

    expect(v.Name.Words).toHaveLength(1);
    expect(v.Name.Words[0]).toBeInstanceOf(PlainWord);

    const v0 = v.Name.Words[0] as PlainWord;

    expect(v0.Text).toBe(`v`);
    expect(v0.Begin.Offset).toBe(3);
    expect(v0.End.Offset).toBe(4);

    // :
    expect(tokens[3]).toBeInstanceOf(ColonToken);

    // f
    expect(tokens[4]).toBeInstanceOf(NameToken);

    const f = tokens[4] as NameToken;

    expect(f.Name.Words).toHaveLength(1);
    expect(f.Name.Words[0]).toBeInstanceOf(PlainWord);

    const f0 = f.Name.Words[0] as PlainWord;

    expect(f0.Text).toBe(`f`);

    // (
    expect(tokens[5]).toBeInstanceOf(OpeningRoundBraceToken);

    // x
    expect(tokens[6]).toBeInstanceOf(NameToken);

    const x = tokens[6] as NameToken;

    expect(x.Name.Words).toHaveLength(1);
    expect(x.Name.Words[0]).toBeInstanceOf(PlainWord);

    const x0 = x.Name.Words[0] as PlainWord;

    expect(x0.Text).toBe(`x`);

    // ,
    expect(tokens[7]).toBeInstanceOf(CommaToken);

    // y
    expect(tokens[8]).toBeInstanceOf(NameToken);

    const y = tokens[8] as NameToken;

    expect(y.Name.Words).toHaveLength(1);
    expect(y.Name.Words[0]).toBeInstanceOf(PlainWord);

    const y0 = y.Name.Words[0] as PlainWord;

    expect(y0.Text).toBe(`y`);

    // )
    expect(tokens[9]).toBeInstanceOf(ClosingRoundBraceToken);
});

it(``, () => {
    const tokens = [ ...Tokens.FromString(`lol kek`) ];

    expect(tokens[0]).toBeInstanceOf(NameToken);

    const name = tokens[0] as NameToken;
    const words = name.Name.Words;

    expect(words).toHaveLength(2);
    expect(words[0]).toBeInstanceOf(PlainWord);

    const word0 = words[0] as PlainWord;

    expect(word0.Text).toBe(`lol`);
    expect(word0.Begin.Offset).toBe(0);
    expect(word0.End.Offset).toBe(3);
    expect(words[1]).toBeInstanceOf(PlainWord);

    const word1 = words[1] as PlainWord;

    expect(word1.Text).toBe(`kek`);
    expect(word1.Begin.Offset).toBe(4);
    expect(word1.End.Offset).toBe(7);
});

it(``, () => {
    const tokens = [ ...Tokens.FromString(`"lol"`) ];

    expect(tokens[0]).toBeInstanceOf(NameToken);

    const name = tokens[0] as NameToken;
    const words = name.Name.Words;

    expect(words).toHaveLength(1);
    expect(words[0]).toBeInstanceOf(QuotedWord);

    const word0 = words[0] as QuotedWord;

    expect(word0.Text).toBe(`"lol"`);
});

it(``, () => {
    const tokens = [ ...Tokens.FromString(`"lol""kek"`) ];

    expect(tokens[0]).toBeInstanceOf(NameToken);

    const name = tokens[0] as NameToken;
    const words = name.Name.Words;

    expect(words).toHaveLength(2);
    expect(words[0]).toBeInstanceOf(QuotedWord);

    const word0 = words[0] as QuotedWord;

    expect(word0.Text).toBe(`"lol"`);
    expect(word0.Begin.Offset).toBe(0);
    expect(word0.End.Offset).toBe(5);
    expect(words[1]).toBeInstanceOf(QuotedWord);

    const word1 = words[1] as QuotedWord;

    expect(word1.Text).toBe(`"kek"`);
    expect(word1.Begin.Offset).toBe(5);
    expect(word1.End.Offset).toBe(10);
});

it(``, () => {
    const tokens = [ ...Tokens.FromString(`print("lol")`) ];

    expect(tokens).toHaveLength(4);

    // print
    expect(tokens[0]).toBeInstanceOf(NameToken);

    const token0 = tokens[0] as NameToken;
    const words = token0.Name.Words;

    expect(words).toHaveLength(1);

    expect(words[0]).toBeInstanceOf(PlainWord);

    const word0 = words[0] as PlainWord;

    expect(word0.Text).toBe(`print`);
    expect(word0.Begin.Offset).toBe(0);
    expect(word0.End.Offset).toBe(5);

    // (
    expect(tokens[1]).toBeInstanceOf(OpeningRoundBraceToken);

    // "lol"
    expect(tokens[2]).toBeInstanceOf(NameToken);

    const token2 = tokens[2] as NameToken;
    const words2 = token2.Name.Words;

    expect(words2).toHaveLength(1);

    expect(words2[0]).toBeInstanceOf(QuotedWord);

    const word2_0 = words2[0] as QuotedWord;

    expect(word2_0.Text).toBe(`"lol"`);
    expect(word2_0.Begin.Offset).toBe(6);
    expect(word2_0.End.Offset).toBe(11);

    // )
    expect(tokens[3]).toBeInstanceOf(ClosingRoundBraceToken);
});
