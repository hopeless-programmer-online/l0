'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

class Word {
}

class PlainWord extends Word {
    constructor({ text, begin, end }) {
        super();
        this.text = text;
        this.begin = begin;
        this.end = end;
    }
}

class QuotedWord extends Word {
    constructor({ text, begin, end }) {
        super();
        this.text = text;
        this.begin = begin;
        this.end = end;
    }
}

class Token {
    constructor({ begin, end }) {
        this.begin = begin;
        this.end = end;
    }
}

class Comment extends Token {
    constructor({ text, begin, end }) {
        super({ begin, end });
        this.text = text;
    }
}

class Identifier extends Token {
    constructor({ words }) {
        super({
            begin: words[0].begin,
            end: words[words.length - 1].end,
        });
        this.words = words;
    }
    get string() {
        return this.words.map(({ text }) => text).join(' ');
    }
}

class Comma extends Token {
}

class Colon extends Token {
}

class RoundOpening extends Token {
}

class RoundClosing extends Token {
}

class SquareOpening extends Token {
}

class SquareClosing extends Token {
}

class CurlyOpening extends Token {
}

class CurlyClosing extends Token {
}

class Location {
    constructor({ offset, line, column }) {
        this.offset = offset;
        this.line = line;
        this.column = column;
    }
}

function* tokenize(text) {
    const { length } = text;
    let offset = 0;
    let line = 0;
    let column = 0;
    function getCurrent() {
        if (offset < length)
            return text[offset];
    }
    function move() {
        if (offset >= length)
            throw new Error; // @todo
        const previous = getCurrent();
        ++offset;
        ++column;
        if (previous === '\n') {
            ++line;
            column = 0;
        }
        const current = getCurrent();
        return current;
    }
    function location() {
        return new Location({ offset, line, column });
    }
    function* skipWhitespace() {
        while (offset < length) {
            const x = getCurrent();
            switch (x) {
                case ';':
                    const begin = location();
                    while (true) {
                        if (offset >= length)
                            return;
                        const x = move();
                        if (x === '\n') {
                            const end = location();
                            yield new Comment({ text: text.substring(begin.offset, end.offset), begin, end });
                            break;
                        }
                    }
                case ' ':
                case '\n':
                case '\r':
                case '\t':
                    break;
                default:
                    return x;
            }
            move();
        }
    }
    function skip(Token) {
        const begin = location();
        move();
        const end = location();
        return new Token({ begin, end });
    }
    function skipWord() {
        while (offset < length) {
            const x = getCurrent();
            switch (x) {
                case undefined:
                case ' ':
                case '\n':
                case '\r':
                case '\t':
                case '(':
                case ')':
                case '[':
                case ']':
                case '{':
                case '}':
                case ',':
                case ':':
                case '\'':
                case '`':
                case '"':
                    return x;
            }
            move();
        }
    }
    function skipString(opening) {
        while (offset < length) {
            const x = getCurrent();
            switch (x) {
                case undefined:
                    throw new Error; // @todo
                case '\\':
                    {
                        const x = move();
                        switch (x) {
                            case 't':
                            case 'n':
                            case 'r':
                            case '\\':
                            case '\'':
                            case '"':
                            case '`':
                                break;
                            default:
                                throw new Error; // @todo
                        }
                    }
                    break;
                case '\'':
                case '`':
                case '"':
                    return x;
            }
            move();
        }
    }
    function* scanWord(words = []) {
        const begin = location();
        skipWord();
        const end = location();
        words.push(new PlainWord({
            text: text.substring(begin.offset, end.offset),
            begin,
            end,
        }));
        const x = yield* skipWhitespace();
        switch (x) {
            // safety check
            case ';':
            case ' ':
            case '\n':
            case '\r':
            case '\t':
                throw new Error; // @todo
            case undefined:
            case '(':
            case ')':
            case '[':
            case ']':
            case '{':
            case '}':
            case ',':
            case ':':
                return words;
            case '\'':
            case '`':
            case '"':
                return yield* scanString(x, words);
            default:
                return yield* scanWord(words);
        }
    }
    function* scanString(opening, words = []) {
        const begin = location();
        move();
        skipString();
        move();
        const end = location();
        words.push(new QuotedWord({
            text: text.substring(begin.offset, end.offset),
            begin,
            end,
        }));
        const x = yield* skipWhitespace();
        switch (x) {
            // safety check
            case ';':
            case ' ':
            case '\n':
            case '\r':
            case '\t':
                throw new Error; // @todo
            case undefined:
            case '(':
            case ')':
            case '[':
            case ']':
            case '{':
            case '}':
            case ',':
            case ':':
                return words;
            case '\'':
            case '`':
            case '"':
                return yield* scanString(x, words);
            default:
                return yield* scanWord(words);
        }
    }
    while (true) {
        const x = yield* skipWhitespace();
        switch (x) {
            // safety check
            case ';':
            case ' ':
            case '\n':
            case '\r':
            case '\t': throw new Error; // @todo
            // end of scanning
            case undefined: return;
            // check for tokens
            case ',':
                yield skip(Comma);
                break;
            case ':':
                yield skip(Colon);
                break;
            case '(':
                yield skip(RoundOpening);
                break;
            case ')':
                yield skip(RoundClosing);
                break;
            case '[':
                yield skip(SquareOpening);
                break;
            case ']':
                yield skip(SquareClosing);
                break;
            case '{':
                yield skip(CurlyOpening);
                break;
            case '}':
                yield skip(CurlyClosing);
                break;
            case '\'':
            case '`':
            case '"':
                {
                    const words = yield* scanString();
                    yield new Identifier({ words });
                }
                break;
            default: {
                const words = yield* scanWord();
                yield new Identifier({ words });
            }
        }
    }
}

var text = /*#__PURE__*/Object.freeze({
    __proto__: null,
    Word: Word,
    PlainWord: PlainWord,
    QuotedWord: QuotedWord,
    Token: Token,
    Comment: Comment,
    Identifier: Identifier,
    Comma: Comma,
    Colon: Colon,
    RoundOpening: RoundOpening,
    RoundClosing: RoundClosing,
    SquareOpening: SquareOpening,
    SquareClosing: SquareClosing,
    CurlyOpening: CurlyOpening,
    CurlyClosing: CurlyClosing,
    Location: Location,
    tokenize: tokenize
});

class Scope {
    constructor({ reference = null, parent = null } = {}) {
        this.reference = reference;
        this.parent = parent;
    }
}

class Commands {
    constructor({ array = [] } = {}) {
        this.entry = new Scope;
        this.leave = new Scope({ parent: this.entry });
        this.array = array;
        array.forEach((command, index) => {
            command.entry.parent = index > 0
                ? array[index - 1].leave
                : this.entry;
        });
        if (array.length > 0)
            this.leave.parent = array[array.length - 1].leave;
    }
    static from(...array) {
        return new Commands({ array });
    }
    get empty() {
        return this.array.length <= 0;
    }
    get first() {
        if (this.empty)
            throw new Error;
        return this.array[0];
    }
    *[Symbol.iterator]() {
        return yield* this.array;
    }
    toString() {
        return this.array.join('\n');
    }
}

class Name {
    constructor({ text }) {
        this.text = text;
    }
    static from(text) {
        return new Name({ text });
    }
    toString() {
        return this.text;
    }
}

class Reference {
    constructor({ name, target }) {
        this.name = name;
        this.target = target;
    }
    static from(text, target) {
        return new Reference({ name: Name.from(text), target });
    }
    toString() {
        return this.name.toString();
    }
}

class Parameter {
    constructor({ name }) {
        this.leave = new Scope({ reference: new Reference({ name, target: this }) });
    }
    get name() {
        const { reference } = this.leave;
        if (!reference)
            throw new Error;
        return reference.name;
    }
    toString() {
        return this.name.toString();
    }
}

class ExplicitParameter extends Parameter {
    static from(text) {
        return new ExplicitParameter({ name: new Name({ text }) });
    }
}

class ImplicitParameter extends Parameter {
    static from(text) {
        return new ImplicitParameter({ name: new Name({ text }) });
    }
}

class Parameters {
    constructor({ array = [] } = {}) {
        this.entry = new Scope;
        this.leave = new Scope({ parent: this.entry });
        this.array = array;
        array.forEach((parameter, index) => {
            parameter.leave.parent = index > 0
                ? array[index - 1].leave
                : this.entry;
        });
        if (array.length > 0)
            this.leave.parent = array[array.length - 1].leave;
    }
    static from(...names) {
        const array = [
            new ImplicitParameter({ name: new Name({ text: 'super' }) }),
            ...names.map(text => new ExplicitParameter({ name: new Name({ text }) })),
        ];
        return new Parameters({ array });
    }
    get explicit() {
        return this.array.filter(parameter => parameter instanceof ExplicitParameter);
    }
    get super() {
        const sup = this.array.find(parameter => parameter instanceof ImplicitParameter && parameter.name.text === 'super');
        if (!sup)
            throw new Error; // @todo
        return sup;
    }
    *[Symbol.iterator]() {
        return yield* this.array;
    }
    toString() {
        return this.explicit.join(', ');
    }
}

class Program {
    constructor({ parameters = new Parameters, commands = new Commands } = {}) {
        this.entry = new Scope;
        this.parameters = parameters;
        this.commands = commands;
        parameters.entry.parent = this.entry;
    }
    toString() {
        const { commands } = this;
        return `(${this.parameters}) {${commands.empty ? `` : commands.toString().replace(/^|\n/g, '\n\t')}\n}`;
    }
}

class Command {
}

class Declaration extends Command {
    constructor({ name, program }) {
        super();
        this._program = null;
        this.entry = new Scope;
        this.leave = new Scope({ reference: new Reference({ name, target: this }), parent: this.entry });
        if (program)
            this.program = program;
    }
    get program() {
        const { _program } = this;
        if (!_program)
            throw new Error; // @todo
        return _program;
    }
    set program(program) {
        if (this._program)
            throw new Error; // @todo
        this._program = program;
    }
    get name() {
        const { reference } = this.leave;
        if (!reference)
            throw new Error;
        return reference.name;
    }
    toString() {
        return `${this.name} ${this.program}`;
    }
}

class Inputs {
    constructor({ array = [] } = {}) {
        this.array = array;
    }
    static from(...array) {
        return new Inputs({ array });
    }
    *[Symbol.iterator]() {
        return yield* this.array;
    }
    toString() {
        return this.array.join(', ');
    }
}

class Output {
    constructor({ name }) {
        this.leave = new Scope({ reference: new Reference({ name, target: this }) });
    }
    get name() {
        const { reference } = this.leave;
        if (!reference)
            throw new Error;
        return reference.name;
    }
    toString() {
        return this.name.toString();
    }
}

class ExplicitOutput extends Output {
}

class ImplicitOutput extends Output {
}

class Outputs {
    constructor({ array = [] } = {}) {
        this.entry = new Scope;
        this.leave = new Scope({ parent: this.entry });
        this.array = array;
        array.forEach((parameter, index) => {
            parameter.leave.parent = index > 0
                ? array[index - 1].leave
                : this.entry;
        });
        if (array.length > 0)
            this.leave.parent = array[array.length - 1].leave;
    }
    static from(...names) {
        const array = [
            new ImplicitOutput({ name: Name.from('sub') }),
            ...names.map(text => new ExplicitOutput({ name: Name.from(text) })),
        ];
        return new Outputs({ array });
    }
    get empty() {
        return this.explicit.length <= 0;
    }
    get explicit() {
        return this.array.filter(output => output instanceof ExplicitOutput);
    }
    *[Symbol.iterator]() {
        return yield* this.array;
    }
    toString() {
        return this.explicit.join(', ');
    }
}

class Execution extends Command {
    constructor({ target, inputs = Inputs.from(), outputs = Outputs.from() }) {
        super();
        this.entry = new Scope;
        this.target = target;
        this.inputs = inputs;
        this.outputs = outputs;
        this.leave = new Scope({ parent: outputs.leave });
    }
    toString() {
        const { outputs, target, inputs } = this;
        return `${outputs}${outputs.empty ? '' : ' : '}${target}(${inputs})`;
    }
}

var front = /*#__PURE__*/Object.freeze({
    __proto__: null,
    Program: Program,
    Parameters: Parameters,
    Parameter: Parameter,
    ExplicitParameter: ExplicitParameter,
    Commands: Commands,
    Command: Command,
    Declaration: Declaration,
    Execution: Execution,
    Inputs: Inputs,
    Outputs: Outputs,
    Output: Output,
    Scope: Scope,
    Reference: Reference,
    Name: Name
});

class Template {
    constructor({ comment = ``, targets }) {
        this.comment = comment;
        this.targets = targets;
    }
    static from(...targets) {
        return new Template({ targets });
    }
}

class Instruction {
}

class InternalInstruction extends Instruction {
    constructor({ template, buffer }) {
        super();
        this.template = template;
        this.buffer = buffer;
    }
}

class ExternalInstruction extends Instruction {
    constructor({ callback }) {
        super();
        this.callback = callback;
    }
}

class TerminalInstruction extends Instruction {
}

class BindInstruction extends ExternalInstruction {
    constructor() {
        super({ callback });
    }
}
function callback(buffer) {
    const declarationTemplate = buffer[2];
    if (!(declarationTemplate instanceof Template))
        throw new Error; // @todo
    const globals = buffer.slice(3);
    const declaration = new InternalInstruction({
        template: declarationTemplate,
        buffer: globals,
    });
    // modifies declaration.buffer
    globals.push(declaration);
    const nextTemplate = buffer[1];
    if (!(nextTemplate instanceof Template))
        throw new Error; // @todo
    const next = new InternalInstruction({
        template: nextTemplate,
        buffer: [...globals], // already contains declaration via push
    });
    return [
        next,
        ...globals,
        declaration,
    ];
}

class Filler {
    constructor({ bind }) {
        this.bind = bind;
    }
    fill(parameter) {
        const { text } = parameter.name;
        // numbers
        if (text.match(/^-?\d+(?:\.\d+)?$/)) {
            const number = Number(text);
            if (!isNaN(number))
                return number;
        }
        // strings
        if (text.match(/^".*"$/)) {
            // @todo: support 'text' and other forms
            return text;
        }
        switch (text) {
            case 'nothing': return undefined;
            case 'true': return true;
            case 'false': return false;
            case 'bind': return this.bind;
            case 'print': return new ExternalInstruction({ callback: ([_, next, ...values]) => {
                    console.log(...values);
                    return [next, next];
                } });
            case 'is instruction': return new ExternalInstruction({ callback: ([_, next, target]) => {
                    const result = target instanceof Instruction;
                    return [next, next, result];
                } });
            case 'is internal instruction': return new ExternalInstruction({ callback: ([_, next, target]) => {
                    const result = target instanceof InternalInstruction;
                    return [next, next, result];
                } });
            case 'is external instruction': return new ExternalInstruction({ callback: ([_, next, target]) => {
                    const result = target instanceof ExternalInstruction;
                    return [next, next, result];
                } });
            case 'is terminal instruction': return new ExternalInstruction({ callback: ([_, next, target]) => {
                    const result = target instanceof TerminalInstruction;
                    return [next, next, result];
                } });
            case 'get template': return new ExternalInstruction({ callback: ([_, next, instruction]) => {
                    if (!(instruction instanceof InternalInstruction))
                        throw new Error;
                    return [next, next, instruction.template];
                } });
            case 'is template': return new ExternalInstruction({ callback: ([_, next, target]) => {
                    const result = target instanceof Template;
                    return [next, next, result];
                } });
            case 'get buffer': return new ExternalInstruction({ callback: ([_, next, instruction]) => {
                    if (!(instruction instanceof InternalInstruction))
                        throw new Error;
                    return [next, next, instruction.buffer.slice()];
                } });
            case 'get targets': return new ExternalInstruction({ callback: ([_, next, template]) => {
                    if (!(template instanceof Template))
                        throw new Error;
                    return [next, next, template.targets];
                } });
            case 'if': return new ExternalInstruction({ callback: ([_, next, condition, then]) => {
                    if (condition)
                        return [then, next];
                    return [next, next];
                } });
            case 'equal': return new ExternalInstruction({ callback: ([_, next, a, b]) => {
                    return [next, next, a === b];
                } });
            case 'at': return new ExternalInstruction({ callback: ([_, next, a, i]) => {
                    return [next, next, a[i]];
                } });
            case 'is_array': return new ExternalInstruction({ callback: ([_, next, a]) => {
                    return [next, next, Array.isArray(a)];
                } });
            case 'array': return new ExternalInstruction({ callback: ([_, next, ...content]) => {
                    return [next, next, content];
                } });
            case 'length': return new ExternalInstruction({ callback: ([_, next, a]) => {
                    return [next, next, a.length];
                } });
            case 'concat': return new ExternalInstruction({ callback: ([_, next, a, b]) => {
                    return [next, next, [...a, ...b]];
                } });
            case 'slice': return new ExternalInstruction({ callback: ([_, next, a, b, e]) => {
                    return [next, next, a.slice(b, e)];
                } });
            case 'push_back': return new ExternalInstruction({ callback: ([_, next, a, x]) => {
                    a.push(x);
                    return [next, next];
                } });
            case 'push_front': return new ExternalInstruction({ callback: ([_, next, a, x]) => {
                    a.unshift(x);
                    return [next, next];
                } });
            case 'minus': return new ExternalInstruction({ callback: ([_, next, a, b]) => {
                    return [next, next, a - b];
                } });
            case 'plus': return new ExternalInstruction({ callback: ([_, next, a, b]) => {
                    return [next, next, a + b];
                } });
            case 'multiply': return new ExternalInstruction({ callback: ([_, next, a, b]) => {
                    return [next, next, a * b];
                } });
            case 'not': return new ExternalInstruction({ callback: ([_, next, a]) => {
                    return [next, next, !a];
                } });
            case 'less': return new ExternalInstruction({ callback: ([_, next, a, b]) => {
                    return [next, next, a < b];
                } });
            default: throw new Error(`Can't fill parameter ${text}`);
        }
    }
}

class Machine {
    constructor({ buffer }) {
        this.buffer = buffer;
    }
    get instruction() {
        const { buffer } = this;
        if (buffer.length < 1)
            throw new Error; // @todo
        return buffer[0];
    }
    step() {
        const { buffer } = this;
        if (buffer.length < 1)
            throw new Error; // @todo
        const instruction = buffer[0];
        if (!(instruction instanceof Instruction))
            throw new Error; // @todo
        if (instruction instanceof TerminalInstruction)
            return;
        else if (instruction instanceof InternalInstruction) {
            const intermediate = [
                instruction,
                ...instruction.buffer,
                ...buffer.slice(1),
            ];
            this.buffer = instruction.template.targets.map(i => {
                if (i >= intermediate.length)
                    throw new Error;
                return intermediate[i];
            });
        }
        else if (instruction instanceof ExternalInstruction) {
            this.buffer = instruction.callback(buffer);
        }
        else
            throw new Error; // todo
    }
}

var back = /*#__PURE__*/Object.freeze({
    __proto__: null,
    Template: Template,
    Instruction: Instruction,
    InternalInstruction: InternalInstruction,
    ExternalInstruction: ExternalInstruction,
    TerminalInstruction: TerminalInstruction,
    BindInstruction: BindInstruction,
    Filler: Filler,
    Machine: Machine
});

function parse(source) {
    const tokens = typeof source === 'string'
        ? tokenize(source)
        : source;
    let token = null;
    function move() {
        while (true) {
            const { done, value } = tokens.next();
            if (value instanceof Comment)
                continue;
            token = (!done && value) || null;
            break;
        }
    }
    let globals = [];
    class Scope {
        constructor({ parent = null, reference = null } = {}) {
            this._parent = parent;
            this.reference = reference;
        }
        static from(target, parent = null) {
            const reference = target && Reference.from(target.name.text, target);
            return new Scope({ reference, parent });
        }
        get parent() {
            return this._parent;
        }
        get targets() {
            const map = new Map();
            let scope = this;
            while (scope) {
                const { reference } = scope;
                if (reference) {
                    const { name, target } = reference;
                    let { text } = name;
                    while (map.has(text))
                        text = `/${text}`;
                    map.set(text, target);
                }
                scope = scope.parent;
            }
            return map;
        }
        get(text) {
            const { targets } = this;
            const target = targets.get(text);
            if (target)
                return Reference.from(text, target);
            const parameter = ExplicitParameter.from(text);
            globals.push(parameter);
            const scope = Scope.from(parameter, root.parent);
            root._parent = scope;
            // workaround for reference type deduction
            return scope.reference;
        }
    }
    const sup = ImplicitParameter.from('super');
    const supScope = Scope.from(sup);
    globals.push(sup);
    const root = new Scope({ parent: supScope });
    let nesting = 0;
    function parseParametersStart() {
        move();
        if (token instanceof RoundClosing)
            return [];
        else if (token instanceof Identifier) {
            return parseParametersContinue(token.string);
        }
        else {
            throw new Error('Parameters expected.');
        }
    }
    function parseParametersContinue(first) {
        const parameters = [first];
        while (true) {
            move();
            if (token instanceof RoundClosing)
                return parameters;
            else if (token instanceof Comma) {
                move();
                if (!(token instanceof Identifier))
                    throw new Error('Identifier expected');
                parameters.push(token.string);
            }
            else {
                throw new Error('Parameters expected.');
            }
        }
    }
    function parseCommand(first, scope) {
        move();
        if (token instanceof RoundOpening) {
            const parameters = parseParametersStart();
            move();
            // workaround for typescript to deduce type correctly
            token = (() => token)();
            if (nesting <= 0) {
                if (token === null) {
                    const command = new Execution({
                        target: scope.get(first.string),
                        inputs: Inputs.from(...parameters.map(x => scope.get(x))),
                    });
                    return { end: true, commands: [command], scope };
                }
            }
            else {
                if (token instanceof CurlyClosing) {
                    const command = new Execution({
                        target: scope.get(first.string),
                        inputs: Inputs.from(...parameters.map(x => scope.get(x))),
                    });
                    --nesting;
                    return { end: true, commands: [command], scope };
                }
            }
            if (token instanceof Identifier) {
                const command = new Execution({
                    target: scope.get(first.string),
                    inputs: Inputs.from(...parameters.map(x => scope.get(x))),
                });
                const other = parseCommand(token, scope);
                return { end: other.end, commands: [command, ...other.commands], scope: other.scope };
            }
            else if (token instanceof CurlyOpening) {
                ++nesting;
                const command = new Declaration({
                    name: Name.from(first.string),
                });
                scope = Scope.from(command, scope);
                const p = Parameters.from(...parameters);
                let s = new Scope({ parent: scope });
                for (const x of p)
                    s = Scope.from(x, s);
                const commands = parseBody(s); // @todo: extract commands
                command.program = new Program({
                    parameters: p,
                    commands: Commands.from(...commands),
                });
                return { end: false, commands: [command], scope };
            }
            throw new Error;
        }
        else if (token instanceof Colon) {
            move();
            if (!(token instanceof Identifier))
                throw new Error('Expecting identifier.');
            const callTarget = token;
            move();
            if (!(token instanceof RoundOpening))
                throw new Error('Expecting parameters.');
            const parameters = parseParametersStart();
            const command = new Execution({
                target: scope.get(callTarget.string),
                inputs: Inputs.from(...parameters.map(x => scope.get(x))),
                outputs: Outputs.from(first.string),
            });
            for (const x of command.outputs)
                scope = Scope.from(x, scope);
            return { end: false, commands: [command], scope };
        }
        else if (token instanceof Comma) {
            const outputs = [first.string];
            while (true) {
                move();
                if (!(token instanceof Identifier))
                    throw new Error('Expecting identifier.');
                outputs.push(token.string);
                move();
                if (token instanceof Colon)
                    break;
                else if (!(token instanceof Comma))
                    throw new Error('Expecting comma.');
            }
            move();
            if (!(token instanceof Identifier))
                throw new Error('Expecting identifier.');
            const callTarget = token;
            move();
            if (!(token instanceof RoundOpening))
                throw new Error('Expecting parameters.');
            const inputs = parseParametersStart();
            const command = new Execution({
                target: scope.get(callTarget.string),
                inputs: Inputs.from(...inputs.map(x => scope.get(x))),
                outputs: Outputs.from(...outputs),
            });
            for (const x of command.outputs)
                scope = Scope.from(x, scope);
            return { end: false, commands: [command], scope };
        }
        throw new Error('Declaration or execution expected.');
    }
    function parseBody(scope) {
        const commands = [];
        while (true) {
            move();
            if (nesting <= 0) {
                if (token === null)
                    return commands;
            }
            else if (token instanceof CurlyClosing) {
                --nesting;
                return commands;
            }
            if (!(token instanceof Identifier))
                throw new Error('Identifier expected.');
            const body = parseCommand(token, scope);
            commands.push(...body.commands);
            if (body.end)
                return commands;
            scope = body.scope;
        }
    }
    const commands = parseBody(root);
    if (token !== null)
        throw new Error; // @todo
    return new Program({
        parameters: new Parameters({ array: globals }),
        commands: new Commands({ array: commands }),
    });
}

function translate(program) {
    const internals = [
        new BindProgram,
    ];
    function collect(program) {
        internals.push(new ProgramLoopTemplate({ program }));
        for (const command of program.commands) {
            if (command instanceof Declaration) {
                internals.push(new DeclarationBindingTemplate({ command }));
                collect(command.program);
            }
            else if (command instanceof Execution) {
                internals.push(new ExecutionContinuationBindingTemplate({ command }), new ExecutionControlPassingTemplate({ command }));
            }
            else {
                throw new Error; // @todo
            }
        }
    }
    collect(program);
    const lookup = new Map();
    function findEntry(program, targets) {
        const { commands } = program;
        if (commands.empty) {
            const loop = targets.find(x => x instanceof ProgramLoopTemplate && x.program === program);
            if (!loop)
                throw new Error; // todo
            return loop;
        }
        const { first } = commands;
        if (first instanceof Declaration) {
            const binding = targets.find(x => x instanceof DeclarationBindingTemplate && x.command === first);
            if (!binding)
                throw new Error; // todo
            return binding;
        }
        else if (first instanceof Execution) {
            const binding = targets.find(x => x instanceof ExecutionContinuationBindingTemplate && x.command === first);
            if (!binding)
                throw new Error; // todo
            return binding;
        }
        else {
            throw new Error; // @todo
        }
    }
    function findEntryIndex(program, targets) {
        const target = findEntry(program, targets);
        const index = targets.indexOf(target);
        if (index < 0)
            throw new Error; // todo
        return index;
    }
    function transform(program, declaration, targets) {
        function transformCommands(commands, targets) {
            if (commands.length <= 0) {
                const selfIndex = 0;
                const superIndex = targets.indexOf(program.parameters.super);
                if (superIndex < 0)
                    throw new Error; // @todo
                const template = new Template({
                    comment: `Super caller${declaration ? ` for ${declaration.name.text}` : ``}`,
                    targets: [
                        superIndex + 1,
                        selfIndex, // no need to compensate self
                    ],
                });
                const placeholder = internals.find(x => x instanceof ProgramLoopTemplate && x.program === program);
                if (!placeholder)
                    throw new Error; // @todo
                if (lookup.has(placeholder))
                    throw new Error; // @todo
                lookup.set(placeholder, template);
                return placeholder;
            }
            const command = commands[0];
            if (command instanceof Declaration) {
                transform(command.program, command, [...targets, command, ...command.program.parameters]);
                const bind = targets.findIndex(x => x instanceof BindProgram);
                if (bind < 0)
                    throw new Error; // @todo
                const target = findEntryIndex(command.program, targets);
                const then = transformCommands(commands.slice(1), [...targets, command]);
                const thenIndex = targets.findIndex(x => x === then);
                if (thenIndex < 0)
                    throw new Error; // @todo
                const template = new Template({
                    comment: `${command.name.text} declaration`,
                    targets: [
                        // pass control to bind program
                        bind + 1,
                        // pass index of next command template as continuation
                        thenIndex + 1,
                        // pass index of target program template
                        target + 1,
                        // pass rest of the parameters
                        ...targets.map((_, i) => i + 1), // add 1 to compensate absence of "self" in targets
                    ],
                });
                const placeholder = internals.find(x => x instanceof DeclarationBindingTemplate && x.command === command);
                if (!placeholder)
                    throw new Error; // @todo
                if (lookup.has(placeholder))
                    throw new Error; // @todo
                lookup.set(placeholder, template);
                return placeholder;
            }
            else if (command instanceof Execution) {
                const bind = targets.findIndex(x => x instanceof BindProgram);
                if (bind < 0)
                    throw new Error; // @todo
                const then = targets.findIndex(x => x instanceof ExecutionControlPassingTemplate && x.command === command);
                if (then < 0)
                    throw new Error; // @todo
                const continuation = transformCommands(commands.slice(1), [
                    // variables binded from current buffer
                    ...targets,
                    // continuation for passing control to target program
                    new ContinuationInstructionPlaceholder,
                    // execution outputs
                    ...command.outputs,
                ]);
                const continuationIndex = targets.findIndex(x => x === continuation);
                if (continuationIndex < 0)
                    throw new Error; // @todo
                const continuationBindingTemplate = new Template({
                    comment: `Continuation binding for ${command.target.name.text}()`,
                    targets: [
                        // pass control to bind program
                        bind + 1,
                        // pass index of control passing template which will accept binded continuation as parameter
                        then + 1,
                        // pass index of the next command template to execute
                        continuationIndex + 1,
                        // pass rest of the parameters (context saving)
                        ...targets.map((_, i) => i + 1), // add 1 to compensate absence of "self" in targets
                    ],
                });
                const continuationBindingPlaceholder = internals.find(x => x instanceof ExecutionContinuationBindingTemplate && x.command === command);
                if (!continuationBindingPlaceholder)
                    throw new Error; // @todo
                if (lookup.has(continuationBindingPlaceholder))
                    throw new Error; // @todo
                lookup.set(continuationBindingPlaceholder, continuationBindingTemplate);
                const target = targets.findIndex(x => x === command.target.target);
                if (target < 0)
                    throw new Error; // @todo
                const controlPassTemplate = new Template({
                    comment: `Control passing for ${command.target.name.text}()`,
                    targets: [
                        // pass control to target
                        target + 1,
                        // pass continuation which will be on top of the buffer after binding
                        targets.length + 1,
                        // pass execution inputs
                        ...[...command.inputs].map(({ target }) => {
                            const index = targets.indexOf(target);
                            if (index < 0)
                                throw new Error; // @todo
                            return index + 1; // add 1 to compensate absence of "self" in targets
                        }),
                    ],
                });
                const controlPassPlaceholder = internals.find(x => x instanceof ExecutionControlPassingTemplate && x.command === command);
                if (!controlPassPlaceholder)
                    throw new Error; // @todo
                if (lookup.has(controlPassPlaceholder))
                    throw new Error; // @todo
                lookup.set(controlPassPlaceholder, controlPassTemplate);
                return continuationBindingPlaceholder;
            }
            throw new Error; // @todo
        }
        transformCommands([...program.commands], [...targets]);
    }
    transform(program, null, [...internals, ...program.parameters]);
    const entry = findEntry(program, internals);
    const entryTemplate = lookup.get(entry);
    if (!entryTemplate)
        throw new Error; // @todo
    const bind = new BindInstruction;
    return new InternalInstruction({
        template: entryTemplate,
        buffer: [
            ...internals.map(x => {
                if (x instanceof BindProgram)
                    return bind;
                if (!(x instanceof TemplatePlaceholder))
                    throw new Error; // @todo
                const template = lookup.get(x);
                if (!template)
                    throw new Error; // @todo
                return template;
            }),
            new TerminalInstruction,
        ],
    });
}
class Placeholder {
}
class BindProgram extends Placeholder {
}
class ContinuationInstructionPlaceholder extends Placeholder {
}
class TemplatePlaceholder extends Placeholder {
}
class ProgramLoopTemplate extends TemplatePlaceholder {
    constructor({ program }) {
        super();
        this.program = program;
    }
}
class DeclarationBindingTemplate extends TemplatePlaceholder {
    constructor({ command }) {
        super();
        this.command = command;
    }
}
class ExecutionContinuationBindingTemplate extends TemplatePlaceholder {
    constructor({ command }) {
        super();
        this.command = command;
    }
}
class ExecutionControlPassingTemplate extends TemplatePlaceholder {
    constructor({ command }) {
        super();
        this.command = command;
    }
}

exports.back = back;
exports.front = front;
exports.parse = parse;
exports.text = text;
exports.translate = translate;
