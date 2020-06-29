import {
    Variable,
    Program,
    DeclarationProgramCommand,
} from "../syntax";

type Token = null | `,` | `:` | `(` | `)` | `{` | `}` | Variable;

class Tokens {
    private generator : Generator<Token>;

    public constructor(text : string) {
        this.generator = this.ParseText(text);
    }

    public get Next() : Token {
        const iterator = this.generator.next();

        if (iterator.done) {
            return null;
        }

        return iterator.value;
    }

    private *ParseText(text : string) : Generator<Token> {
        let index = 0;

        function word() : Variable {
            let end = index + 1;

            scan: while (end < text.length) {
                const character = text[end];

                switch (character) {
                    case `(`:
                    case `)`:
                    case `{`:
                    case `}`:
                    case `;`:
                    case `,`:
                    case `:`: {
                        break scan;
                    } break;
                    case `"`:
                    case `'`:
                    case `\``: {
                        throw new Error; // @todo
                    } break;
                }

                ++end;
            }

            const name = text
                .substring(index, end)
                .replace(/\s+/g, ` `);

            return new Variable({ Name : name });
        }

        while (index < text.length) {
            const character = text[index];

            switch (character) {
                case ` `:
                case `\t`:
                case `\n`:
                case `\r`: {
                    // do nothing
                } break;
                case `,`:
                case `:`:
                case `(`:
                case `)`:
                case `{`:
                case `}`: {
                    yield character;
                } break;
                case `;`:
                case `"`:
                case `'`:
                case `\``: {
                    throw new Error; // @todo
                } break;
                default: {
                    yield word();
                } break;
            }

            ++index;
        }

        return null;
    }
}

export default class Parser {
    Parse(text : string) : Program {
        const program = new Program;
        const tokens = new Tokens(text);
        const first = tokens.Next;

        if (first === null) {
            return program;
        }
        if (!(first instanceof Variable)) {
            throw new Error; // @todo
        }

        const second = tokens.Next;

        if (second !== `(`) {
            throw new Error; // @todo
        }

        const third = tokens.Next;

        if (third !== `)`) {
            throw new Error; // @todo
        }

        const fourth = tokens.Next;

        if (fourth !== `{`) {
            throw new Error; // @todo
        }

        const fifth = tokens.Next;

        if (fifth !== `}`) {
            throw new Error; // @todo
        }

        const command = new DeclarationProgramCommand({
            Variable : first,
            Program  : new Program,
        });

        program.Commands.Array.push(command);

        const sixth = tokens.Next;

        if (sixth === null) {
            return program;
        }

        throw new Error;
    }
}
