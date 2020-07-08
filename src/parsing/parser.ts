import {
    Variable,
    Program,
    ProgramParameters,
    ExplicitProgramParameter,
    ProgramCommands,
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
        const tokens = new Tokens(text);

        function parseVariables(first : Token) : Array<Variable> {
            const variables : Array<Variable> = [];

            if (first === `)`) {
                return variables;
            }
            if (!(first instanceof Variable)) {
                throw new Error; // @todo
            }

            variables.push(first);

            while (true) {
                const second = tokens.Next;

                if (second === `)`) {
                    return variables;
                }
                if (second !== `,`) {
                    throw new Error; // @todo
                }

                const third = tokens.Next;

                if (!(third instanceof Variable)) {
                    throw new Error; // @todo
                }

                variables.push(third);
            }
        }
        function parseCommands(first : Token, commands : ProgramCommands) : Token {
            if (!(first instanceof Variable)) {
                return first;
            }

            const second = tokens.Next;

            if (second !== `(`) {
                throw new Error; // @todo
            }

            const variables = parseVariables(tokens.Next);
            const fourth = tokens.Next;

            if (fourth !== `{`) {
                throw new Error; // @todo
            }

            const program = new Program({
                Parameters : new ProgramParameters(
                    ...variables.map((variable, index) =>
                        new ExplicitProgramParameter({
                            Variable : variable,
                            Index    : index,
                        }),
                    ),
                ),
            })
            const fifth = parseCommands(tokens.Next, program.Commands);

            if (fifth !== `}`) {
                throw new Error; // @todo
            }

            const command = new DeclarationProgramCommand({
                Variable : first,
                Program  : program,
            });

            commands.Array.push(command);

            return tokens.Next;
        }

        const program = new Program;
        const first = tokens.Next;

        if (first === null) {
            return program;
        }

        const second = parseCommands(first, program.Commands);

        if (second !== null) {
            throw new Error;
        }

        return program;
    }
}
