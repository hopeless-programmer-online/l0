import Token from "./token";
import Name from "./name";
import NameToken from "./name-token";
import OpeningRoundBraceToken from "./opening-round-brace-token";
import ClosingRoundBraceToken from "./closing-round-brace-token";
import OpeningFigureBraceToken from "./opening-figure-brace-token";
import ClosingFigureBraceToken from "./closing-figure-brace-token";
import ColonToken from "./colon-token";
import CommaToken from "./comma-token";
import Word from "./word";
import PlainWord from "./plain-word";
import QuotedWord from "./quoted-word";
import Position from "./position";

export default class Tokens {
    public static FromString(text : string) {
        const array : Array<Token> = [];

        let offset = 0;

        function position() {
            return new Position({
                Offset : offset,
                Line   : 0, // @todo
                Column : 0, // @todo
            });
        }

        function processLetter(words : Array<Word> = []) {
            // @todo: assert that text[offset] is letter

            let wordBegin = position();
            let begin = offset;

            function push() {
                const wordText = text.substring(begin, offset);
                const wordEnd = position();
                const word = new PlainWord({
                    Text  : wordText,
                    Begin : wordBegin,
                    End   : wordEnd,
                });

                words.push(word);
            }
            function end() {
                const name = new Name({ Words : words });
                const token = new NameToken({ Name : name });

                array.push(token);
            }

            main : while (true) {
                ++offset;

                if (offset >= text.length) {
                    push();
                    end();

                    state = null;

                    return;
                }

                const character = text[offset];

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
                            ++offset;

                            if (offset >= text.length) {
                                end();

                                state = null;

                                return;
                            }

                            const character = text[offset];

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
                                    begin = offset;
                                    wordBegin = position();

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
        function processQuote(words : Array<Word> = []) {
            const wordBegin = position();

            let begin = offset;

            main : while (true) {
                ++offset;

                if (offset >= text.length) throw new Error; // @todo

                const character = text[offset];

                switch(character) {
                    case `\\`: {
                        ++offset;

                        if (offset >= text.length) throw new Error; // @todo

                        const character = text[offset];

                        switch(character) {
                            case `n`:
                            case `r`:
                            case `t`:
                            case `'`:
                            case `"`:
                            case `\\`: {
                                // do nothing
                            } break;
                            default: {
                                throw new Error; // @todo
                            } break;
                        }
                    } break;
                    case `"`: {
                        ++offset;

                        const wordText = text.substring(begin, offset);
                        const wordEnd  = position();
                        const word = new QuotedWord({
                            Text  : wordText,
                            Begin : wordBegin,
                            End   : wordEnd,
                        });

                        words.push(word);

                        --offset;

                        break main;
                    } break;
                    default: {
                        // do nothing
                    } break;
                }
            }

            while (true) {
                ++offset;

                if (offset >= text.length) {
                    const name = new Name({ Words : words });
                    const token = new NameToken({ Name : name });

                    array.push(token);

                    state = null;

                    return;
                }

                const character = text[offset];

                switch(character) {
                    // skip spaces
                    case ` `:
                    case `\n`:
                    case `\r`:
                    case `\t`: {
                        // do nothing
                    } break;
                    case `"`: {
                        processQuote(words);

                        return;
                    } break;
                    // reserved
                    case `[`:
                    case `]`:
                    case `.`:
                    case `;`:
                    case `'`:
                    case `\``: {
                        throw new Error; // @todo
                    } break;
                    default: {
                        const name = new Name({ Words : words });
                        const token = new NameToken({ Name : name });

                        array.push(token);

                        state = process;

                        return;
                    } break;
                }
            }
        }
        function process() {
            while (true) {
                if (offset >= text.length) {
                    state = null;

                    return;
                }

                const character = text[offset];

                switch (character) {
                    case `(`:  {
                        const tokenBegin = position();

                        ++offset;

                        const tokenEnd = position();

                        array.push(new OpeningRoundBraceToken({
                            Begin : tokenBegin,
                            End   : tokenEnd,
                        }));

                        continue;
                    } break;
                    case `)`:  {
                        const tokenBegin = position();

                        ++offset;

                        const tokenEnd = position();

                        array.push(new ClosingRoundBraceToken({
                            Begin : tokenBegin,
                            End   : tokenEnd,
                        }));

                        continue;
                    } break;
                    case `{`: {
                        const tokenBegin = position();

                        ++offset;

                        const tokenEnd = position();

                        array.push(new OpeningFigureBraceToken({
                            Begin : tokenBegin,
                            End   : tokenEnd,
                        }));

                        continue;
                    } break;
                    case `}`: {
                        const tokenBegin = position();

                        ++offset;

                        const tokenEnd = position();

                        array.push(new ClosingFigureBraceToken({
                            Begin : tokenBegin,
                            End   : tokenEnd,
                        }));

                        continue;
                    } break;
                    case `:`: {
                        const tokenBegin = position();

                        ++offset;

                        const tokenEnd = position();

                        array.push(new ColonToken({
                            Begin : tokenBegin,
                            End   : tokenEnd,
                        }));

                        continue;
                    } break;
                    case `,`: {
                        const tokenBegin = position();

                        ++offset;

                        const tokenEnd = position();

                        array.push(new CommaToken({
                            Begin : tokenBegin,
                            End   : tokenEnd,
                        }));

                        continue;
                    } break;
                    case `"`: {
                        processQuote();

                        return;
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
                    case `\``: {
                        throw new Error; // @todo
                    } break;
                    // plain word
                    default : {
                        return processLetter();
                    } break;
                }

                ++offset;
            }
        }

        let state : null | (() => void) = process;

        while (state) state();

        if (offset < text.length) throw new Error; // @todo

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
