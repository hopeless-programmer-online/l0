import { Analyzer as Lexer } from './lexis'
import {
    Main,
    Program,
    Parameters,
    Parameter,
    Commands,
    Declaration,
    Call,
    Inputs,
    Input,
    Outputs,
    Output,
    Analyzer,
} from './syntax'

function parse(text : string) {
    const lexer = new Lexer
    const lexemes = lexer.analyze(text)
    const parser = new Analyzer
    const main = parser.analyze(lexemes)

    return main
}

test(`Check export`, () => {
    expect(Main).toBeDefined()
    expect(Program).toBeDefined()
    expect(Parameters).toBeDefined()
    expect(Parameter).toBeDefined()
    expect(Commands).toBeDefined()
    expect(Declaration).toBeDefined()
    expect(Call).toBeDefined()
    expect(Inputs).toBeDefined()
    expect(Input).toBeDefined()
    expect(Outputs).toBeDefined()
    expect(Output).toBeDefined()
})

describe(`Check analyzer`, () => {
    test(`Smoke test`, () => {
        expect(parse(
            `f() {\n` +
            `    g() {\n` +
            `    }\n` +
            `}`
        )).toMatchObject({
            symbol : Main.symbol,
            commands : { list : [
                {   symbol : Declaration.symbol,
                    program : {
                        symbol : Program.symbol,
                        commands : { list : [
                            {   symbol : Declaration.symbol,
                                program : {
                                    symbol : Program.symbol,
                                    commands : { list : [] },
                                },
                            },
                        ] },
                    },
                },
            ] },
        })
    })
})
