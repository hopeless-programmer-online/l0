import {
    Name,
    Variable,
    Reference,
    Program,
    ProgramParameters,
    ExplicitProgramParameter,
    ProgramCommands,
    DeclarationProgramCommand,
    ExecutionProgramCommand,
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
                .replace(/^\s*/, ``)
                .replace(/\s*$/, ``)
                .replace(/\s+/g, ` `)
                ;

            index = end - 1;

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
            readonly Parent : CommandParsingState | null;
            protected program : Program;

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
                this.Parent = Parent;
            }

            public Process() : ParsingState {
                const first = tokens.Next;

                if (this.Parent === null) {
                    if (first === null) {
                        return new TerminalState({ Program : this.program });
                    }
                }
                else {
                    if (first === `}`) {
                        return this.Parent;
                    }
                }
                if (!(first instanceof Variable)) {
                    throw new Error(`Variable expected, got ${JSON.stringify(first)}.`);
                }

                return new VariableCommandParsingState({
                    Variable : first,
                    Previous : this,
                    Program  : this.program,
                    Context  : this.context,
                });
            }
        }
        class VariableCommandParsingState extends NonTerminalState {
            protected variable : Variable;
            protected previous : CommandParsingState;
            protected program : Program;

            public constructor({
                Variable,
                Context  = new ParsingContext,
                Program  = new ProgramClass,
                Previous,
            } : {
                Variable : Variable,
                Context? : Context,
                Program? : Program,
                Previous : CommandParsingState,
            }) {
                super({ Context });

                this.program = Program;
                this.previous = Previous;
                this.variable = Variable;
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
                const second = tokens.Next;

                if (second !== `(`) {
                    throw new Error(`"(" expected, got ${JSON.stringify(second instanceof Variable ? second.toString() : second)}.`);
                }

                const variables = this.ProcessVariables();
                const fourth = tokens.Next;

                if (this.previous.Parent === null) {
                    if (fourth === null) {
                        const reference = this.context.Get(this.variable);
                        const command = new ExecutionProgramCommand({
                            Program : reference,
                        });

                        this.program.Commands.Array.push(command);

                        return new TerminalState({ Program : this.program });
                    }
                }
                else {
                    if (fourth === `}`) {
                        const reference = this.context.Get(this.variable);
                        const command = new ExecutionProgramCommand({
                            Program : reference,
                        });

                        this.program.Commands.Array.push(command);

                        return this.previous.Parent;
                    }
                }
                if (fourth instanceof Variable) {
                    const reference = this.context.Get(this.variable);
                    const command = new ExecutionProgramCommand({
                        Program : reference,
                    });

                    this.program.Commands.Array.push(command);

                    this.variable = fourth;

                    return this;
                }
                if (fourth !== `{`) {
                    throw new Error; // @todo
                }

                this.context.Declare(this.variable);

                const parameters = new ProgramParameters;

                // using "for" instead of "Array.prototype.map" to avoid recursion overflow
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
                    Variable : this.variable,
                    Program  : program,
                });

                this.program.Commands.Array.push(command);

                return new CommandParsingState({
                    Context : new Context(this.context),
                    Program : program,
                    Parent  : this.previous,
                });
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
    private references : Map<string, Reference> = new Map;

    public constructor(parent : Context | null = null) {
        this.parent = parent;
    }

    private GetByString(string : string) : Reference {
        let context : Context | null = this;

        do {
            const reference = context.references.get(string);

            if (reference) {
                return reference;
            }

            context = context.parent;
        } while (context);

        throw new Error; // @todo
    }

    public Declare(variable : Variable) {
        const name = variable.Name;
        const reference = new Reference({
            Variable : variable,
            Name     : name,
        });
        const string = name.String;
        const { references } = this;

        if (references.has(string)) {
            throw new Error(`Variable with name ${JSON.stringify(string)} was already declared in current context.`);
        }

        references.set(string, reference);
    }
    public Get(variable : Variable) : Reference {
        const string = variable.Name.String;

        return this.GetByString(string);
    }
}

const ParsingContext = Context;
const VariableClass = Variable;
const ProgramClass = Program;
