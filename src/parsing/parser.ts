import {
    Name,
    Variable,
    Reference,
    Program,
    ProgramParameters,
    ExplicitProgramParameter,
    ImplicitProgramParameter,
    DeclarationProgramCommand,
    ExecutionProgramCommand,
    ExecutionProgramCommandInputs,
    ExplicitExecutionProgramCommandInput,
    ExecutionProgramCommandOutputs,
    ExplicitExecutionProgramCommandOutput,
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
            public abstract Process() : ParsingState;
        }
        class CommandParsingState extends NonTerminalState {
            protected context : Context;
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
                super();

                this.context = Context;
                this.program = Program;
                this.Parent = Parent;
            }

            public get Context() : Context {
                return this.context;
            }
            public get Program() : Program {
                return this.program;
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
                });
            }
        }
        class VariableCommandParsingState extends NonTerminalState {
            protected variable : Variable;
            protected previous : CommandParsingState;

            public constructor({
                Variable,
                Previous,
            } : {
                Variable : Variable,
                Previous : CommandParsingState,
            }) {
                super();

                this.previous = Previous;
                this.variable = Variable;
            }

            private ProcessVariables() : Array<Variable> {
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
            private ConvertOutputs(variables : Array<Variable>) : ExecutionProgramCommandOutputs {
                const outputs = new ExecutionProgramCommandOutputs;

                // using "for" instead of "Array.prototype.map" to avoid recursion overflow
                for (let index = 0; index < variables.length; ++index) {
                    const input = new ExplicitExecutionProgramCommandOutput({
                        Variable : variables[index],
                        Index    : index,
                    });

                    outputs.Array.push(input);
                }

                return outputs;
            }
            private ConvertInputs(variables : Array<Variable>) : ExecutionProgramCommandInputs {
                const inputs = new ExecutionProgramCommandInputs;

                // using "for" instead of "Array.prototype.map" to avoid recursion overflow
                for (let index = 0; index < variables.length; ++index) {
                    const input = new ExplicitExecutionProgramCommandInput({
                        Reference : this.previous.Context.Get(variables[index]),
                        Index     : index,
                    });

                    inputs.Array.push(input);
                }

                return inputs;
            }
            private ProcessExecution(outputs : ExecutionProgramCommandOutputs) : ParsingState {
                const first = tokens.Next;

                if (!(first instanceof Variable)) {
                    throw new Error; // @todo
                }

                const second = tokens.Next;

                if (second !== `(`) {
                    throw new Error; // @todo
                }

                const program = this.previous.Context.Get(first);
                const execution = new ExecutionProgramCommand({
                    Outputs : outputs,
                    Program : program,
                    Inputs  : this.ConvertInputs(this.ProcessVariables()),
                });

                this.previous.Program.Commands.Array.push(execution);

                for (const output of outputs.Array) {
                    this.previous.Context.Declare(output.Variable);
                }

                return this.previous;
            }

            public Process() : ParsingState {
                const second = tokens.Next;

                if (second === `:`) {
                    return this.ProcessExecution(this.ConvertOutputs([ this.variable ]));
                }
                if (second === `,`) {
                    const variables : Array<Variable> = [ this.variable ];

                    while (true) {
                        const third = tokens.Next;

                        if (!(third instanceof Variable)) {
                            throw new Error; // @todo
                        }

                        variables.push(third);

                        const fourth = tokens.Next;

                        if (fourth === `:`) {
                            break;
                        }
                        if (fourth !== `,`) {
                            throw new Error; // @todo
                        }
                    }

                    return this.ProcessExecution(this.ConvertOutputs(variables));
                }
                if (second !== `(`) {
                    throw new Error(`"(" expected, got ${JSON.stringify(second instanceof Variable ? second.toString() : second)}.`);
                }

                const variables = this.ProcessVariables();
                const fourth = tokens.Next;

                if (this.previous.Parent === null) {
                    if (fourth === null) {
                        const reference = this.previous.Context.Get(this.variable);
                        const command = new ExecutionProgramCommand({
                            Program : reference,
                            Inputs  : this.ConvertInputs(variables),
                        });

                        this.previous.Program.Commands.Array.push(command);

                        return new TerminalState({ Program : this.previous.Program });
                    }
                }
                else {
                    if (fourth === `}`) {
                        const reference = this.previous.Context.Get(this.variable);
                        const command = new ExecutionProgramCommand({
                            Program : reference,
                            Inputs  : this.ConvertInputs(variables),
                        });

                        this.previous.Program.Commands.Array.push(command);

                        return this.previous.Parent;
                    }
                }
                if (fourth instanceof Variable) {
                    const reference = this.previous.Context.Get(this.variable);
                    const command = new ExecutionProgramCommand({
                        Program : reference,
                        Inputs  : this.ConvertInputs(variables),
                    });

                    this.previous.Program.Commands.Array.push(command);

                    this.variable = fourth;

                    return this;
                }
                if (fourth !== `{`) {
                    throw new Error; // @todo
                }

                this.previous.Context.Declare(this.variable);

                const parameters = new ProgramParameters;

                parameters.Array.push(new ImplicitProgramParameter({
                    Variable : new Variable({
                        Name : new Name({
                            String : `return`,
                        }),
                    }),
                }));

                // using "for" instead of "Array.prototype.map" to avoid recursion overflow
                for (let index = 0; index < variables.length; ++index) {
                    const parameter = new ExplicitProgramParameter({
                        Variable : variables[index],
                        Index    : index,
                    });

                    parameters.Array.push(parameter);
                }

                for (const parameter of parameters.Array) {
                    this.previous.Context.Declare(parameter.Variable);
                }

                const program = new Program({
                    Parameters : parameters,
                });
                const command = new DeclarationProgramCommand({
                    Variable : this.variable,
                    Program  : program,
                });

                this.previous.Program.Commands.Array.push(command);

                return new CommandParsingState({
                    Context : new Context(this.previous.Context),
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

    private TryGetByString(string : string) : Reference | null {
        let context : Context | null = this;

        do {
            const reference = context.references.get(string);

            if (reference) {
                return reference;
            }

            context = context.parent;
        } while (context);

        return null;
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

        throw new Error(`Variable with name ${JSON.stringify(string)} does not exists.`);
    }
    private Displace(string : string, reference : Reference) {
        const { references } = this;

        // @todo: optimize O(n^2) performance
        while (true) {
            const existing = this.TryGetByString(string);

            if (!existing) {
                break;
            }

            references.set(string, reference);

            string = `../${string}`;
            reference = new Reference({
                Variable : existing.Variable,
                Name     : new Name({
                    String : string,
                }),
            });
        }

        references.set(string, reference);
    }

    public Declare(variable : Variable) {
        const name = variable.Name;
        const reference = new Reference({
            Variable : variable,
            Name     : name,
        });

        this.Displace(name.String, reference);
    }
    public Get(variable : Variable) : Reference {
        const string = variable.Name.String;

        return this.GetByString(string);
    }
}

const ParsingContext = Context;
const ProgramClass = Program;
