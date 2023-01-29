import { Analyzer as Lexer } from './lexis'
import {
    BareWord,
    Name,
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
    ExplicitParameter,
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
    test(`Check empty string`, () => {
        expect(parse(``)).toMatchObject({
            symbol : Main.symbol,
            parameters : { explicit : [] },
            commands : { list : [] },
        })
    })
    test(`Check declaration`, () => {
        expect(parse(
            `f() {\n` +
            `}`
        )).toMatchObject({
            symbol : Main.symbol,
            parameters : { explicit : [] },
            commands : { list : [
                {   symbol : Declaration.symbol,
                    name : { words : [
                        { symbol : BareWord.symbol, text : `f` },
                    ] },
                    program : {
                        symbol : Program.symbol,
                        parameters : { explicit : [] },
                        commands : { list : [] },
                    },
                },
            ] },
        })
    })
    test(`Check single parameter`, () => {
        expect(parse(
            `f(x) {\n` +
            `}`
        )).toMatchObject({
            symbol : Main.symbol,
            commands : { list : [
                {   symbol : Declaration.symbol,
                    name : { words : [
                        { symbol : BareWord.symbol, text : `f` },
                    ] },
                    program : {
                        symbol : Program.symbol,
                        parameters : { explicit : [
                            {   symbol : ExplicitParameter.symbol,
                                name : { words : [
                                    { symbol : BareWord.symbol, text : `x` },
                                ] },
                            },
                        ] },
                        commands : { list : [] },
                    },
                },
            ] },
        })
    })
    test(`Check two parameters`, () => {
        expect(parse(
            `f(x, y) {\n` +
            `}`
        )).toMatchObject({
            symbol : Main.symbol,
            commands : { list : [
                {   symbol : Declaration.symbol,
                    name : { words : [
                        { symbol : BareWord.symbol, text : `f` },
                    ] },
                    program : {
                        symbol : Program.symbol,
                        parameters : { explicit : [
                            {   symbol : ExplicitParameter.symbol,
                                name : { words : [
                                    { symbol : BareWord.symbol, text : `x` },
                                ] },
                            },
                            {   symbol : ExplicitParameter.symbol,
                                name : { words : [
                                    { symbol : BareWord.symbol, text : `y` },
                                ] },
                            },
                        ] },
                        commands : { list : [] },
                    },
                },
            ] },
        })
    })
    test(`Check three parameters`, () => {
        expect(parse(
            `f(x, y, z) {\n` +
            `}`
        )).toMatchObject({
            symbol : Main.symbol,
            commands : { list : [
                {   symbol : Declaration.symbol,
                    name : { words : [
                        { symbol : BareWord.symbol, text : `f` },
                    ] },
                    program : {
                        symbol : Program.symbol,
                        parameters : { explicit : [
                            {   symbol : ExplicitParameter.symbol,
                                name : { words : [
                                    { symbol : BareWord.symbol, text : `x` },
                                ] },
                            },
                            {   symbol : ExplicitParameter.symbol,
                                name : { words : [
                                    { symbol : BareWord.symbol, text : `y` },
                                ] },
                            },
                            {   symbol : ExplicitParameter.symbol,
                                name : { words : [
                                    { symbol : BareWord.symbol, text : `z` },
                                ] },
                            },
                        ] },
                        commands : { list : [] },
                    },
                },
            ] },
        })
    })
    test(`Check trailing comma in parameters`, () => {
        expect(parse(
            `f(x,) {\n` +
            `}`
        )).toMatchObject({
            symbol : Main.symbol,
            commands : { list : [
                {   symbol : Declaration.symbol,
                    name : { words : [
                        { symbol : BareWord.symbol, text : `f` },
                    ] },
                    program : {
                        symbol : Program.symbol,
                        parameters : { explicit : [
                            {   symbol : ExplicitParameter.symbol,
                                name : { words : [
                                    { symbol : BareWord.symbol, text : `x` },
                                ] },
                            },
                        ] },
                        commands : { list : [] },
                    },
                },
            ] },
        })
    })
    test(`Check nested declaration`, () => {
        expect(parse(
            `f() {\n` +
            `    g() {\n` +
            `    }\n` +
            `}`
        )).toMatchObject({
            symbol : Main.symbol,
            commands : { list : [
                {   symbol : Declaration.symbol,
                    name : { words : [
                        { symbol : BareWord.symbol, text : `f` },
                    ] },
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
    test(`Check call`, () => {
        expect(parse(
            `f()`
        )).toMatchObject({
            symbol : Main.symbol,
            parameters : { explicit : [] },
            commands : { list : [
                {   symbol : Call.symbol,
                    target : {
                        name : { words : [
                            { symbol : BareWord.symbol, text : `f` },
                        ] },
                    },
                },
            ] },
        })
    })
    test(`Check single input`, () => {
        expect(parse(
            `f(x)`
        )).toMatchObject({
            symbol : Main.symbol,
            parameters : { explicit : [] },
            commands : { list : [
                {   symbol : Call.symbol,
                    target : {
                        name : { words : [
                            { symbol : BareWord.symbol, text : `f` },
                        ] },
                    },
                    inputs : { list : [
                        { target : {
                            name : { words : [
                                { symbol : BareWord.symbol, text : `x` },
                            ] },
                        } },
                    ] },
                },
            ] },
        })
    })
    test(`Check two inputs`, () => {
        expect(parse(
            `f(x, x)`
        )).toMatchObject({
            symbol : Main.symbol,
            parameters : { explicit : [] },
            commands : { list : [
                {   symbol : Call.symbol,
                    target : {
                        name : { words : [
                            { symbol : BareWord.symbol, text : `f` },
                        ] },
                    },
                    inputs : { list : [
                        { target : {
                            name : { words : [
                                { symbol : BareWord.symbol, text : `x` },
                            ] },
                        } },
                        { target : {
                            name : { words : [
                                { symbol : BareWord.symbol, text : `x` },
                            ] },
                        } },
                    ] },
                },
            ] },
        })
    })
    test(`Check three inputs`, () => {
        expect(parse(
            `f(x, x, x)`
        )).toMatchObject({
            symbol : Main.symbol,
            parameters : { explicit : [] },
            commands : { list : [
                {   symbol : Call.symbol,
                    target : {
                        name : { words : [
                            { symbol : BareWord.symbol, text : `f` },
                        ] },
                    },
                    inputs : { list : [
                        { target : {
                            name : { words : [
                                { symbol : BareWord.symbol, text : `x` },
                            ] },
                        } },
                        { target : {
                            name : { words : [
                                { symbol : BareWord.symbol, text : `x` },
                            ] },
                        } },
                        { target : {
                            name : { words : [
                                { symbol : BareWord.symbol, text : `x` },
                            ] },
                        } },
                    ] },
                },
            ] },
        })
    })
    test(`Check single output`, () => {
        expect(parse(
            `x : f()`
        )).toMatchObject({
            symbol : Main.symbol,
            parameters : { explicit : [] },
            commands : { list : [
                {   symbol : Call.symbol,
                    target : {
                        name : { words : [
                            { symbol : BareWord.symbol, text : `f` },
                        ] },
                    },
                    inputs : { list : [
                    ] },
                    outputs : { explicit : [
                        { name : { words : [
                            { symbol : BareWord.symbol, text : `x` },
                        ] } },
                    ] },
                },
            ] },
        })
    })
    describe(`Check combinations`, () => {
        test(`Check declaration + declaration`, () => {
            expect(parse(
                `f() {\n` +
                `}\n` +
                `f() {\n` +
                `}`
            )).toMatchObject({
                symbol : Main.symbol,
                parameters : { explicit : [] },
                commands : { list : [
                    {   symbol : Declaration.symbol,
                        name : { words : [
                            { symbol : BareWord.symbol, text : `f` },
                        ] },
                        program : {
                            symbol : Program.symbol,
                            parameters : { explicit : [] },
                            commands : { list : [] },
                        },
                    },
                    {   symbol : Declaration.symbol,
                        name : { words : [
                            { symbol : BareWord.symbol, text : `f` },
                        ] },
                        program : {
                            symbol : Program.symbol,
                            parameters : { explicit : [] },
                            commands : { list : [] },
                        },
                    },
                ] },
            })
        })
        test(`Check declaration + call`, () => {
            expect(parse(
                `f() {\n` +
                `}\n` +
                `f()`
            )).toMatchObject({
                symbol : Main.symbol,
                parameters : { explicit : [] },
                commands : { list : [
                    {   symbol : Declaration.symbol,
                        name : { words : [
                            { symbol : BareWord.symbol, text : `f` },
                        ] },
                        program : {
                            symbol : Program.symbol,
                            parameters : { explicit : [] },
                            commands : { list : [] },
                        },
                    },
                    {   symbol : Call.symbol,
                        target : {
                            name : { words : [
                                { symbol : BareWord.symbol, text : `f` },
                            ] },
                        },
                    },
                ] },
            })
        })
        test(`Check call + declaration`, () => {
            expect(parse(
                `f()\n` +
                `f() {\n` +
                `}`
            )).toMatchObject({
                symbol : Main.symbol,
                parameters : { explicit : [] },
                commands : { list : [
                    {   symbol : Call.symbol,
                        target : {
                            name : { words : [
                                { symbol : BareWord.symbol, text : `f` },
                            ] },
                        },
                    },
                    {   symbol : Declaration.symbol,
                        name : { words : [
                            { symbol : BareWord.symbol, text : `f` },
                        ] },
                        program : {
                            symbol : Program.symbol,
                            parameters : { explicit : [] },
                            commands : { list : [] },
                        },
                    },
                ] },
            })
        })
        test(`Check call + call`, () => {
            expect(parse(
                `f()\n` +
                `f()`
            )).toMatchObject({
                symbol : Main.symbol,
                parameters : { explicit : [] },
                commands : { list : [
                    {   symbol : Call.symbol,
                        target : {
                            name : { words : [
                                { symbol : BareWord.symbol, text : `f` },
                            ] },
                        },
                    },
                    {   symbol : Call.symbol,
                        target : {
                            name : { words : [
                                { symbol : BareWord.symbol, text : `f` },
                            ] },
                        },
                    },
                ] },
            })
        })
    })
})
