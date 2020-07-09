import {
    Name,
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

            const string = text
                .substring(index, end)
                .replace(/\s+/g, ` `);

            return new Variable({ Name : new Name({ String : string }) });
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

        abstract class ParsingState {
        }
        class TerminalState extends ParsingState {
            readonly Program : Program;

            public constructor({ Program } : { Program : Program }) {
                super();

                this.Program = Program;
            }
        }
        abstract class NonTerminalState extends ParsingState {
            protected context : Context;

            public constructor({
                Context = new ParsingContext,
            } : {
                Context : Context,
            } = {
                Context : new ParsingContext,
            }) {
                super();

                this.context = Context;
            }

            public abstract Process() : ParsingState;
        }
        class CommandParsingState extends NonTerminalState {
            private parent : CommandParsingState | null;
            private program : Program;

            public constructor({
                Context = new ParsingContext,
                Program = new ProgramClass,
                Parent  = null,
            } : {
                Context? : Context,
                Program? : Program,
                Parent?  : CommandParsingState | null,
            } = {
                Context : new ParsingContext,
                Program : new ProgramClass,
                Parent  : null,
            }) {
                super({ Context });

                this.program = Program;
                this.parent = Parent;
            }

            public ProcessVariables() : Array<Variable> {
                const variables : Array<Variable> = [];
                const first = tokens.Next;

                if (first === `)`) {
                    return variables;
                }
                if (!(first instanceof Variable)) {
                    throw new Error; // @todo
                }

                variables.push(first);

                while (true) {
                    const first = tokens.Next;

                    if (first === `)`) {
                        return variables;
                    }
                    if (first !== `,`) {
                        throw new Error; // @todo
                    }

                    const second = tokens.Next;

                    if (!(second instanceof Variable)) {
                        throw new Error; // @todo
                    }

                    variables.push(second);
                }
            }
            public Process() : ParsingState {
                const first = tokens.Next;

                if (this.parent === null) {
                    if (first === null) {
                        return new TerminalState({ Program : this.program });
                    }
                }
                else {
                    if (first === `}`) {
                        return this.parent;
                    }
                }
                if (!(first instanceof Variable)) {
                    throw new Error;
                }
                // if (this.context.Has(first)) {
                //     throw new Error; // @todo
                // }

                const second = tokens.Next;

                if (second !== `(`) {
                    throw new Error; // @todo
                }

                const variables = this.ProcessVariables();
                const fourth = tokens.Next;

                if (fourth !== `{`) {
                    throw new Error; // @todo
                }

                const parameters = new ProgramParameters;

                for (let index = 0; index < variables.length; ++index) {
                    const parameter = new ExplicitProgramParameter({
                        Variable : variables[index],
                        Index    : index,
                    });

                    parameters.Array.push(parameter);
                }

                const program = new Program({
                    Parameters : parameters,
                });
                const command = new DeclarationProgramCommand({
                    Variable : first,
                    Program  : program,
                });

                this.program.Commands.Array.push(command);

                return new CommandParsingState({ Parent : this, Program : command.Program });
            }
        }

        let state : ParsingState = new CommandParsingState;

        while (state instanceof NonTerminalState) {
            state = state.Process();
        }

        if (!(state instanceof TerminalState)) {
            throw new Error; // @todo
        }

        return state.Program;
    }
}

class Context {
    private parent : Context | null;
    private declarations : Map<string, Variable> = new Map;

    public constructor(parent : Context | null = null) {
        this.parent = parent;
    }

    private HasString(string : string) : boolean {
        if (this.declarations.has(string)) {
            return true;
        }

        return this.parent !== null && this.parent.HasString(string);
    }

    public Declare(variable : Variable) {
        const string = variable.Name.String;
        const { declarations } = this;

        if (declarations.has(string)) {
            throw new Error; // @todo
        }

        declarations.set(string, variable);
    }
    public Has(variable : Variable) : boolean {
        const string = variable.Name.String;

        return this.HasString(string);
    }
}

const ParsingContext = Context;
const ProgramClass = Program;
