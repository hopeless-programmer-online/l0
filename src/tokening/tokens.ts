import Token from "./token";
import NameToken from "./name-token";
import OpeningRoundBraceToken from "./opening-round-brace-token";
import ClosingRoundBraceToken from "./closing-round-brace-token";
import OpeningFigureBraceToken from "./opening-figure-brace-token";
import ClosingFigureBraceToken from "./closing-figure-brace-token";
import ColonToken from "./colon-token";
import CommaToken from "./comma-token";

export default class Tokens {
    private array : Array<Token> = [];

    public constructor(text : string) {
        let position = 0;

        while (position < text.length) {
            const character = text[position];

            switch (character) {
                case `(`:  {
                    ++position;

                    this.array.push(new OpeningRoundBraceToken);
                } break;
                case `)`:  {
                    ++position;

                    this.array.push(new ClosingRoundBraceToken);
                } break;
                case `[`:  throw new Error; // @todo
                case `]`:  throw new Error; // @todo
                case `{`: {
                    ++position;

                    this.array.push(new OpeningFigureBraceToken);
                } break;
                case `}`: {
                    ++position;

                    this.array.push(new ClosingFigureBraceToken);
                } break;
                case `.`:  throw new Error; // @todo
                case `:`: {
                    ++position;

                    this.array.push(new ColonToken);
                } break;
                case `,`: {
                    ++position;

                    this.array.push(new CommaToken);
                } break;
                case `;`:  throw new Error; // @todo
                case `'`:  throw new Error; // @todo
                case `"`:  throw new Error; // @todo
                case `\``: throw new Error; // @todo
                // skip whitespace
                case ` `:
                case `\n`:
                case `\r`:
                case `\t`: {
                    ++position;
                } break;
                // regular name
                default : {
                    const { name, end } = this.ScanName(text, position);

                    position = end;

                    this.array.push(name);
                } break;
            }
        }
    }

    public get Array() {
        return this.array;
    }

    public * [Symbol.iterator]() {
        return yield * this.array;
    }

    private ScanName(text : string, position : number) {
        let end = position + 1;

        traverse: while (end < text.length) {
            const character = text[end];

            switch (character) {
                case `(`:
                case `)`:
                case `[`:
                case `]`:
                case `{`:
                case `}`:
                case `.`:
                case `:`:
                case `,`:
                case `;`: {
                    break traverse;
                } break;
                case `'`:  throw new Error; // @todo
                case `"`:  throw new Error; // @todo
                case `\``: throw new Error; // @todo
                // skip whitespace
                case ` `:
                case `\n`:
                case `\r`:
                case `\t`:
                // regular name
                default : {
                    ++end;
                } break;
            }
        }

        const string = text
            .substring(position, end)
            .replace(/\s+/g, ` `)
            .replace(/^\s*/g, ``)
            .replace(/\s*$/g, ``);
        const name = new NameToken({ String : string });

        return { name, end };
    }
}
