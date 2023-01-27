export abstract class Program {
    public readonly parameters : Parameters
    public readonly commands : Commands

    public constructor() {
        throw new Error // @todo
    }
}

export class MainProgram extends Program {
    public static readonly symbol : unique symbol = Symbol(`l0.syntax.MainProgram`)

    public readonly symbol : typeof MainProgram.symbol = MainProgram.symbol
}

export class DeclaredProgram extends Program {
    public static readonly symbol : unique symbol = Symbol(`l0.syntax.DeclaredProgram`)

    public readonly symbol : typeof DeclaredProgram.symbol = DeclaredProgram.symbol
    public readonly declaration : DeclarationCommand

    public constructor() {
        throw new Error // @todo

        super()
    }
}

export class Parameters {
    public readonly program : Program

    public constructor() {
        throw new Error // @todo
    }

    public * [Symbol.iterator]() : Iterator<ParameterUnion, void> {
    }
}

export abstract class Parameter {
}

export class ClosureParameter extends Parameter {
    public static readonly symbol : unique symbol = Symbol(`l0.syntax.ClosureParameter`)

    public readonly symbol : typeof ClosureParameter.symbol = ClosureParameter.symbol
}

export class SuperParameter extends Parameter {
    public static readonly symbol : unique symbol = Symbol(`l0.syntax.SuperParameter`)

    public readonly symbol : typeof SuperParameter.symbol = SuperParameter.symbol
}

export class ExplicitParameter extends Parameter {
    public static readonly symbol : unique symbol = Symbol(`l0.syntax.ExplicitParameter`)

    public readonly symbol : typeof ExplicitParameter.symbol = ExplicitParameter.symbol
}

export type ParameterUnion = ClosureParameter | SuperParameter | ExplicitParameter

export class Commands {
    public readonly program : Program

    public constructor() {
        throw new Error // @todo
    }

    public * [Symbol.iterator]() : Iterator<CommandUnion, void> {
    }
}

export abstract class Command {
    public readonly commands : Commands

    public constructor() {
        throw new Error // @todo
    }
}

export class DeclarationCommand extends Command {
    public static readonly symbol : unique symbol = Symbol(`l0.syntax.DeclarationCommand`)

    public readonly symbol : typeof DeclarationCommand.symbol = DeclarationCommand.symbol
    public readonly program : DeclaredProgram

    public constructor() {
        throw new Error // @todo

        super()
    }
}

export class CallCommand extends Command {
    public static readonly symbol : unique symbol = Symbol(`l0.syntax.CallCommand`)

    public readonly symbol : typeof CallCommand.symbol = CallCommand.symbol
    public readonly inputs : Inputs
    public readonly outputs : Outputs

    public constructor() {
        throw new Error // @todo

        super()
    }
}

export type CommandUnion = DeclarationCommand | CallCommand

export class Inputs {
    public readonly call : CallCommand

    public constructor() {
        throw new Error // @todo
    }

    public * [Symbol.iterator]() : Iterator<Input, void> {
    }
}

export class Input {
    public readonly inputs : Inputs

    public constructor() {
        throw new Error // @todo
    }
}

export class Outputs {
    public readonly call : CallCommand

    public constructor() {
        throw new Error // @todo
    }

    public * [Symbol.iterator]() : Iterator<OutputUnion, void> {
    }
}

export abstract class Output {
    public readonly outputs : Outputs

    public constructor() {
        throw new Error // @todo
    }
}

export class SubOutput extends Output {
    public static readonly symbol : unique symbol = Symbol(`l0.syntax.SubOutput`)

    public readonly symbol : typeof SubOutput.symbol = SubOutput.symbol
}

export class ExplicitOutput extends Output {
    public static readonly symbol : unique symbol = Symbol(`l0.syntax.ExplicitOutput`)

    public readonly symbol : typeof ExplicitOutput.symbol = ExplicitOutput.symbol
}

export type OutputUnion = SubOutput | ExplicitOutput
