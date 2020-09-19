import Token from "./token";
import NameToken from "./name-token";
import OpeningRoundBraceToken from "./opening-round-brace-token";
import ClosingRoundBraceToken from "./closing-round-brace-token";
import OpeningFigureBraceToken from "./opening-figure-brace-token";
import ClosingFigureBraceToken from "./closing-figure-brace-token";
import ColonToken from "./colon-token";
import CommaToken from "./comma-token";
import Word from "./word";
import PlainWord from "./plain-word";

export default class Tokens {
    public static FromString(text : string) {
        const array : Array<Token> = [];

        let position = 0;

        function processLetter() {
            // @todo: assert that text[position] is letter
            const words : Array<Word> = [];

            let begin = position;

            function push() {
                const wordText = text.substring(begin, position);
                const word = new PlainWord({ Text : wordText });

                words.push(word);
            }
            function end() {
                const token = new NameToken({ Words : words });

                array.push(token);
            }

            main : while (true) {
                ++position;

                if (position >= text.length) {
                    push();
                    end();

                    state = null;

                    return;
                }

                const character = text[position];

                switch(character) {
                    case `(`:
                    case `)`:
                    case `{`:
                    case `}`:
                    case `:`:
                    case `,`: {
                        push();
                        end();

                        state = process;

                        return;
                    } break;
                    case ` `:
                    case `\n`:
                    case `\r`:
                    case `\t`: {
                        push();

                        while (true) {
                            ++position;

                            if (position >= text.length) {
                                end();

                                state = null;

                                return;
                            }

                            const character = text[position];

                            switch (character) {
                                case `(`:
                                case `)`:
                                case `{`:
                                case `}`:
                                case `:`:
                                case `,`: {
                                    end();

                                    state = process;

                                    return;
                                } break;
                                case ` `:
                                case `\n`:
                                case `\r`:
                                case `\t`: {
                                    // do nothing
                                } break;
                                default: {
                                    begin = position;

                                    continue main;
                                } break;
                            }
                        }
                    } break;
                    case `'`:
                    case `"`:
                    case `\``:
                    case `[`:
                    case `]`:
                    case `.`:
                    case `;`: {
                        throw new Error; // @todo
                    } break;
                    default: {
                        // do nothing
                    } break;
                }
            }
        }
        function process() {
            while (true) {
                if (position >= text.length) {
                    state = null;

                    return;
                }

                const character = text[position];

                switch (character) {
                    case `(`:  {
                        array.push(new OpeningRoundBraceToken);
                    } break;
                    case `)`:  {
                        array.push(new ClosingRoundBraceToken);
                    } break;
                    case `{`: {
                        array.push(new OpeningFigureBraceToken);
                    } break;
                    case `}`: {
                        array.push(new ClosingFigureBraceToken);
                    } break;
                    case `:`: {
                        array.push(new ColonToken);
                    } break;
                    case `,`: {
                        array.push(new CommaToken);
                    } break;
                    // skip whitespace
                    case ` `:
                    case `\n`:
                    case `\r`:
                    case `\t`: {
                        // do nothing
                    } break;
                    // reserved
                    case `[`:
                    case `]`:
                    case `.`:
                    case `;`:
                    case `'`:
                    case `"`:
                    case `\``: {
                        throw new Error; // @todo
                    } break;
                    // plain word
                    default : {
                        return processLetter();
                    } break;
                }

                ++position;
            }
        }

        let state : null | (() => void) = process;

        while (state) state();

        if (position < text.length) throw new Error; // @todo

        return new Tokens({ Array : array });
    }

    private array : Array<Token>;

    public constructor({ Array } : { Array : Array<Token> }) {
        this.array = Array;
    }

    public get Array() {
        return this.array;
    }

    public * [Symbol.iterator]() {
        return yield * this.Array;
    }
}
