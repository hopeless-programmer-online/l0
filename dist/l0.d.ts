declare class Location {
    readonly offset: number;
    readonly line: number;
    readonly column: number;
    constructor({ offset, line, column }: {
        offset: number;
        line: number;
        column: number;
    });
}

declare abstract class Token {
    readonly begin: Location;
    readonly end: Location;
    constructor({ begin, end }: {
        begin: Location;
        end: Location;
    });
}

declare class Identifier extends Token {
    readonly value: string;
    constructor({ value, begin, end }: {
        value: string;
        begin: Location;
        end: Location;
    });
}

declare class Comma extends Token {
}

declare class Colon extends Token {
}

declare class RoundOpening extends Token {
}

declare class RoundClosing extends Token {
}

declare class SquareOpening extends Token {
}

declare class SquareClosing extends Token {
}

declare class CurlyOpening extends Token {
}

declare class CurlyClosing extends Token {
}

type text_d_Token = Token;
declare const text_d_Token: typeof Token;
type text_d_Identifier = Identifier;
declare const text_d_Identifier: typeof Identifier;
type text_d_Comma = Comma;
declare const text_d_Comma: typeof Comma;
type text_d_Colon = Colon;
declare const text_d_Colon: typeof Colon;
type text_d_RoundOpening = RoundOpening;
declare const text_d_RoundOpening: typeof RoundOpening;
type text_d_RoundClosing = RoundClosing;
declare const text_d_RoundClosing: typeof RoundClosing;
type text_d_SquareOpening = SquareOpening;
declare const text_d_SquareOpening: typeof SquareOpening;
type text_d_SquareClosing = SquareClosing;
declare const text_d_SquareClosing: typeof SquareClosing;
type text_d_CurlyOpening = CurlyOpening;
declare const text_d_CurlyOpening: typeof CurlyOpening;
type text_d_CurlyClosing = CurlyClosing;
declare const text_d_CurlyClosing: typeof CurlyClosing;
type text_d_Location = Location;
declare const text_d_Location: typeof Location;
declare namespace text_d {
  export {
    text_d_Token as Token,
    text_d_Identifier as Identifier,
    text_d_Comma as Comma,
    text_d_Colon as Colon,
    text_d_RoundOpening as RoundOpening,
    text_d_RoundClosing as RoundClosing,
    text_d_SquareOpening as SquareOpening,
    text_d_SquareClosing as SquareClosing,
    text_d_CurlyOpening as CurlyOpening,
    text_d_CurlyClosing as CurlyClosing,
    text_d_Location as Location,
  };
}

declare class Name {
    static from(text: string): Name;
    readonly text: string;
    constructor({ text }: {
        text: string;
    });
    toString(): string;
}

declare class Declaration extends Command {
    private _program;
    readonly entry: Scope;
    readonly leave: Scope;
    constructor({ name, program }: {
        name: Name;
        program?: Program;
    });
    get program(): Program;
    set program(program: Program);
    get name(): Name;
    toString(): string;
}

declare abstract class Output {
    readonly leave: Scope;
    constructor({ name }: {
        name: Name;
    });
    get name(): Name;
    toString(): string;
}

declare abstract class Parameter {
    readonly leave: Scope;
    constructor({ name }: {
        name: Name;
    });
    get name(): Name;
    toString(): string;
}

declare type Target$1 = Declaration | Parameter | Output | null;
declare class Reference {
    static from(text: string, target: Target$1): Reference;
    readonly name: Name;
    readonly target: Target$1;
    constructor({ name, target }: {
        name: Name;
        target: Target$1;
    });
    toString(): string;
}

declare type Parent = Scope | null;
declare class Scope {
    reference: Reference | null;
    parent: Parent;
    constructor({ reference, parent }?: {
        reference?: Reference | null;
        parent?: Parent;
    });
}

declare abstract class Command {
    abstract get entry(): Scope;
    abstract get leave(): Scope;
}

declare class Commands {
    static from(...array: Array<Command>): Commands;
    private readonly array;
    readonly entry: Scope;
    readonly leave: Scope;
    constructor({ array }?: {
        array?: Array<Command>;
    });
    get empty(): boolean;
    get first(): Command;
    [Symbol.iterator](): Generator<Command, any, undefined>;
    toString(): string;
}

declare class Parameters {
    static from(...names: Array<string>): Parameters;
    private readonly array;
    readonly entry: Scope;
    readonly leave: Scope;
    constructor({ array }?: {
        array?: Array<Parameter>;
    });
    get explicit(): Parameter[];
    get super(): Parameter;
    [Symbol.iterator](): Generator<Parameter, any, undefined>;
    toString(): string;
}

declare class Program {
    readonly parameters: Parameters;
    readonly commands: Commands;
    readonly entry: Scope;
    constructor({ parameters, commands }?: {
        parameters?: Parameters;
        commands?: Commands;
    });
    toString(): string;
}

declare class ExplicitParameter extends Parameter {
    static from(text: string): ExplicitParameter;
}

declare type Input = Reference;
declare class Inputs {
    static from(...array: Array<Input>): Inputs;
    private readonly array;
    constructor({ array }?: {
        array?: Array<Input>;
    });
    [Symbol.iterator](): Generator<Reference, any, undefined>;
    toString(): string;
}

declare class Outputs {
    static from(...names: Array<string>): Outputs;
    private readonly array;
    readonly entry: Scope;
    readonly leave: Scope;
    constructor({ array }?: {
        array?: Array<Output>;
    });
    get empty(): boolean;
    get explicit(): Output[];
    [Symbol.iterator](): Generator<Output, any, undefined>;
    toString(): string;
}

declare type Target = Reference;
declare class Execution extends Command {
    readonly entry: Scope;
    readonly leave: Scope;
    target: Target;
    inputs: Inputs;
    outputs: Outputs;
    constructor({ target, inputs, outputs }: {
        target: Target;
        inputs?: Inputs;
        outputs?: Outputs;
    });
    toString(): string;
}

type front_d_Program = Program;
declare const front_d_Program: typeof Program;
type front_d_Parameters = Parameters;
declare const front_d_Parameters: typeof Parameters;
type front_d_Parameter = Parameter;
declare const front_d_Parameter: typeof Parameter;
type front_d_ExplicitParameter = ExplicitParameter;
declare const front_d_ExplicitParameter: typeof ExplicitParameter;
type front_d_Commands = Commands;
declare const front_d_Commands: typeof Commands;
type front_d_Command = Command;
declare const front_d_Command: typeof Command;
type front_d_Declaration = Declaration;
declare const front_d_Declaration: typeof Declaration;
type front_d_Execution = Execution;
declare const front_d_Execution: typeof Execution;
type front_d_Inputs = Inputs;
declare const front_d_Inputs: typeof Inputs;
type front_d_Outputs = Outputs;
declare const front_d_Outputs: typeof Outputs;
type front_d_Output = Output;
declare const front_d_Output: typeof Output;
type front_d_Scope = Scope;
declare const front_d_Scope: typeof Scope;
type front_d_Reference = Reference;
declare const front_d_Reference: typeof Reference;
type front_d_Name = Name;
declare const front_d_Name: typeof Name;
declare namespace front_d {
  export {
    front_d_Program as Program,
    front_d_Parameters as Parameters,
    front_d_Parameter as Parameter,
    front_d_ExplicitParameter as ExplicitParameter,
    front_d_Commands as Commands,
    front_d_Command as Command,
    front_d_Declaration as Declaration,
    front_d_Execution as Execution,
    front_d_Inputs as Inputs,
    front_d_Outputs as Outputs,
    front_d_Output as Output,
    front_d_Scope as Scope,
    front_d_Reference as Reference,
    Target$1 as ReferenceTarget,
    front_d_Name as Name,
  };
}

declare class Template {
    static from(...targets: number[]): Template;
    readonly targets: number[];
    constructor({ targets }: {
        targets: number[];
    });
}

declare abstract class Instruction {
}

declare type Buffer$1 = any[];
declare class InternalInstruction extends Instruction {
    readonly template: Template;
    readonly buffer: Buffer$1;
    constructor({ template, buffer }: {
        template: Template;
        buffer: Buffer$1;
    });
}

declare type Callback = (buffer: any[]) => any[];
declare class ExternalInstruction extends Instruction {
    readonly callback: Callback;
    constructor({ callback }: {
        callback: Callback;
    });
}

declare class TerminalInstruction extends Instruction {
}

declare class BindInstruction extends ExternalInstruction {
    constructor();
}

declare class Filler {
    private bind;
    constructor({ bind }: {
        bind: BindInstruction;
    });
    fill(parameter: ExplicitParameter): string | number | boolean | ExternalInstruction | undefined;
}

declare type Buffer = any[];
declare class Machine {
    buffer: Buffer;
    constructor({ buffer }: {
        buffer: Buffer;
    });
    get instruction(): any;
    step(): void;
}

type back_d_Template = Template;
declare const back_d_Template: typeof Template;
type back_d_Instruction = Instruction;
declare const back_d_Instruction: typeof Instruction;
type back_d_InternalInstruction = InternalInstruction;
declare const back_d_InternalInstruction: typeof InternalInstruction;
type back_d_ExternalInstruction = ExternalInstruction;
declare const back_d_ExternalInstruction: typeof ExternalInstruction;
type back_d_TerminalInstruction = TerminalInstruction;
declare const back_d_TerminalInstruction: typeof TerminalInstruction;
type back_d_BindInstruction = BindInstruction;
declare const back_d_BindInstruction: typeof BindInstruction;
type back_d_Filler = Filler;
declare const back_d_Filler: typeof Filler;
type back_d_Machine = Machine;
declare const back_d_Machine: typeof Machine;
declare namespace back_d {
  export {
    back_d_Template as Template,
    back_d_Instruction as Instruction,
    back_d_InternalInstruction as InternalInstruction,
    back_d_ExternalInstruction as ExternalInstruction,
    back_d_TerminalInstruction as TerminalInstruction,
    back_d_BindInstruction as BindInstruction,
    back_d_Filler as Filler,
    back_d_Machine as Machine,
  };
}

declare function parse(source: string): Program;

declare function translate(program: Program): InternalInstruction;

export { back_d as back, front_d as front, parse, text_d as text, translate };
