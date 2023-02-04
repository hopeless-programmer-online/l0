import { Analyzer as Lexer } from './lexis'
import {
    BareWord,
    MainProgram,
    DeclaredProgram,
    Parameters,
    GenericParameter,
    Commands,
    DeclarationCommand,
    CallCommand,
    Inputs,
    Input,
    Outputs,
    GenericOutput,
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
    expect(MainProgram).toBeDefined()
    expect(DeclaredProgram).toBeDefined()
    expect(Parameters).toBeDefined()
    expect(GenericParameter).toBeDefined()
    expect(Commands).toBeDefined()
    expect(DeclarationCommand).toBeDefined()
    expect(CallCommand).toBeDefined()
    expect(Inputs).toBeDefined()
    expect(Input).toBeDefined()
    expect(Outputs).toBeDefined()
    expect(GenericOutput).toBeDefined()
})

describe(`Check analyzer`, () => {
    test(`Check empty string`, () => {
        expect(parse(``)).toMatchObject({
            symbol : MainProgram.symbol,
            parameters : { explicit : [] },
            commands : { list : [] },
        })
    })
    test(`Check declaration`, () => {
        expect(parse(
            `f() {\n` +
            `}`
        )).toMatchObject({
            symbol : MainProgram.symbol,
            parameters : { explicit : [] },
            commands : { list : [
                {   symbol : DeclarationCommand.symbol,
                    name : { words : [
                        { symbol : BareWord.symbol, text : `f` },
                    ] },
                    program : {
                        symbol : DeclaredProgram.symbol,
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
            symbol : MainProgram.symbol,
            commands : { list : [
                {   symbol : DeclarationCommand.symbol,
                    name : { words : [
                        { symbol : BareWord.symbol, text : `f` },
                    ] },
                    program : {
                        symbol : DeclaredProgram.symbol,
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
            symbol : MainProgram.symbol,
            commands : { list : [
                {   symbol : DeclarationCommand.symbol,
                    name : { words : [
                        { symbol : BareWord.symbol, text : `f` },
                    ] },
                    program : {
                        symbol : DeclaredProgram.symbol,
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
            symbol : MainProgram.symbol,
            commands : { list : [
                {   symbol : DeclarationCommand.symbol,
                    name : { words : [
                        { symbol : BareWord.symbol, text : `f` },
                    ] },
                    program : {
                        symbol : DeclaredProgram.symbol,
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
    test(`Check trailing comma after single parameter`, () => {
        expect(parse(
            `f(x,) {\n` +
            `}`
        )).toMatchObject({
            symbol : MainProgram.symbol,
            commands : { list : [
                {   symbol : DeclarationCommand.symbol,
                    name : { words : [
                        { symbol : BareWord.symbol, text : `f` },
                    ] },
                    program : {
                        symbol : DeclaredProgram.symbol,
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
    test(`Check trailing comma after two parameters`, () => {
        expect(parse(
            `f(x, y,) {\n` +
            `}`
        )).toMatchObject({
            symbol : MainProgram.symbol,
            commands : { list : [
                {   symbol : DeclarationCommand.symbol,
                    name : { words : [
                        { symbol : BareWord.symbol, text : `f` },
                    ] },
                    program : {
                        symbol : DeclaredProgram.symbol,
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
    test(`Check nested declaration`, () => {
        expect(parse(
            `f() {\n` +
            `    g() {\n` +
            `    }\n` +
            `}`
        )).toMatchObject({
            symbol : MainProgram.symbol,
            commands : { list : [
                {   symbol : DeclarationCommand.symbol,
                    name : { words : [
                        { symbol : BareWord.symbol, text : `f` },
                    ] },
                    program : {
                        symbol : DeclaredProgram.symbol,
                        commands : { list : [
                            {   symbol : DeclarationCommand.symbol,
                                program : {
                                    symbol : DeclaredProgram.symbol,
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
            symbol : MainProgram.symbol,
            parameters : { explicit : [
                {   symbol : ExplicitParameter.symbol,
                    name : { words : [
                        { symbol : BareWord.symbol, text : `f` },
                    ] },
                },
            ] },
            commands : { list : [
                {   symbol : CallCommand.symbol,
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
            symbol : MainProgram.symbol,
            parameters : { explicit : [
                {   symbol : ExplicitParameter.symbol,
                    name : { words : [
                        { symbol : BareWord.symbol, text : `f` },
                    ] },
                },
                {   symbol : ExplicitParameter.symbol,
                    name : { words : [
                        { symbol : BareWord.symbol, text : `x` },
                    ] },
                },
            ] },
            commands : { list : [
                {   symbol : CallCommand.symbol,
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
            symbol : MainProgram.symbol,
            parameters : { explicit : [
                {   symbol : ExplicitParameter.symbol,
                    name : { words : [
                        { symbol : BareWord.symbol, text : `f` },
                    ] },
                },
                {   symbol : ExplicitParameter.symbol,
                    name : { words : [
                        { symbol : BareWord.symbol, text : `x` },
                    ] },
                },
            ] },
            commands : { list : [
                {   symbol : CallCommand.symbol,
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
            symbol : MainProgram.symbol,
            parameters : { explicit : [
                {   symbol : ExplicitParameter.symbol,
                    name : { words : [
                        { symbol : BareWord.symbol, text : `f` },
                    ] },
                },
                {   symbol : ExplicitParameter.symbol,
                    name : { words : [
                        { symbol : BareWord.symbol, text : `x` },
                    ] },
                },
            ] },
            commands : { list : [
                {   symbol : CallCommand.symbol,
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
    test(`Check trailing comma after single input`, () => {
        expect(parse(
            `f(x,)`
        )).toMatchObject({
            symbol : MainProgram.symbol,
            parameters : { explicit : [
                {   symbol : ExplicitParameter.symbol,
                    name : { words : [
                        { symbol : BareWord.symbol, text : `f` },
                    ] },
                },
                {   symbol : ExplicitParameter.symbol,
                    name : { words : [
                        { symbol : BareWord.symbol, text : `x` },
                    ] },
                },
            ] },
            commands : { list : [
                {   symbol : CallCommand.symbol,
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
    test(`Check trailing comma after two inputs`, () => {
        expect(parse(
            `f(x, y,)`
        )).toMatchObject({
            symbol : MainProgram.symbol,
            parameters : { explicit : [
                {   symbol : ExplicitParameter.symbol,
                    name : { words : [
                        { symbol : BareWord.symbol, text : `f` },
                    ] },
                },
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
            commands : { list : [
                {   symbol : CallCommand.symbol,
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
                                { symbol : BareWord.symbol, text : `y` },
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
            symbol : MainProgram.symbol,
            parameters : { explicit : [
                {   symbol : ExplicitParameter.symbol,
                    name : { words : [
                        { symbol : BareWord.symbol, text : `f` },
                    ] },
                },
            ] },
            commands : { list : [
                {   symbol : CallCommand.symbol,
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
    test(`Check two outputs`, () => {
        expect(parse(
            `x, y : f()`
        )).toMatchObject({
            symbol : MainProgram.symbol,
            parameters : { explicit : [
                {   symbol : ExplicitParameter.symbol,
                    name : { words : [
                        { symbol : BareWord.symbol, text : `f` },
                    ] },
                },
            ] },
            commands : { list : [
                {   symbol : CallCommand.symbol,
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
                        { name : { words : [
                            { symbol : BareWord.symbol, text : `y` },
                        ] } },
                    ] },
                },
            ] },
        })
    })
    test(`Check three outputs`, () => {
        expect(parse(
            `x, y, z : f()`
        )).toMatchObject({
            symbol : MainProgram.symbol,
            parameters : { explicit : [
                {   symbol : ExplicitParameter.symbol,
                    name : { words : [
                        { symbol : BareWord.symbol, text : `f` },
                    ] },
                },
            ] },
            commands : { list : [
                {   symbol : CallCommand.symbol,
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
                        { name : { words : [
                            { symbol : BareWord.symbol, text : `y` },
                        ] } },
                        { name : { words : [
                            { symbol : BareWord.symbol, text : `z` },
                        ] } },
                    ] },
                },
            ] },
        })
    })
    test(`Check trailing comma after single output`, () => {
        expect(parse(
            `x, : f()`
        )).toMatchObject({
            symbol : MainProgram.symbol,
            parameters : { explicit : [
                {   symbol : ExplicitParameter.symbol,
                    name : { words : [
                        { symbol : BareWord.symbol, text : `f` },
                    ] },
                },
            ] },
            commands : { list : [
                {   symbol : CallCommand.symbol,
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
    test(`Check trailing comma after two outputs`, () => {
        expect(parse(
            `x, y, : f()`
        )).toMatchObject({
            symbol : MainProgram.symbol,
            parameters : { explicit : [
                {   symbol : ExplicitParameter.symbol,
                    name : { words : [
                        { symbol : BareWord.symbol, text : `f` },
                    ] },
                },
            ] },
            commands : { list : [
                {   symbol : CallCommand.symbol,
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
                        { name : { words : [
                            { symbol : BareWord.symbol, text : `y` },
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
                symbol : MainProgram.symbol,
                parameters : { explicit : [] },
                commands : { list : [
                    {   symbol : DeclarationCommand.symbol,
                        name : { words : [
                            { symbol : BareWord.symbol, text : `f` },
                        ] },
                        program : {
                            symbol : DeclaredProgram.symbol,
                            parameters : { explicit : [] },
                            commands : { list : [] },
                        },
                    },
                    {   symbol : DeclarationCommand.symbol,
                        name : { words : [
                            { symbol : BareWord.symbol, text : `f` },
                        ] },
                        program : {
                            symbol : DeclaredProgram.symbol,
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
                symbol : MainProgram.symbol,
                parameters : { explicit : [] },
                commands : { list : [
                    {   symbol : DeclarationCommand.symbol,
                        name : { words : [
                            { symbol : BareWord.symbol, text : `f` },
                        ] },
                        program : {
                            symbol : DeclaredProgram.symbol,
                            parameters : { explicit : [] },
                            commands : { list : [] },
                        },
                    },
                    {   symbol : CallCommand.symbol,
                        target : {
                            name : { words : [
                                { symbol : BareWord.symbol, text : `f` },
                            ] },
                        },
                    },
                ] },
            })
        })
        test(`Check declaration + outputs`, () => {
            expect(parse(
                `f() {\n` +
                `}\n` +
                `x : f()`
            )).toMatchObject({
                symbol : MainProgram.symbol,
                parameters : { explicit : [] },
                commands : { list : [
                    {   symbol : DeclarationCommand.symbol,
                        name : { words : [
                            { symbol : BareWord.symbol, text : `f` },
                        ] },
                        program : {
                            symbol : DeclaredProgram.symbol,
                            parameters : { explicit : [] },
                            commands : { list : [] },
                        },
                    },
                    {   symbol : CallCommand.symbol,
                        target : {
                            name : { words : [
                                { symbol : BareWord.symbol, text : `f` },
                            ] },
                        },
                        outputs : { explicit : [
                            { name : { words : [
                                { symbol : BareWord.symbol, text : `x` },
                            ] } },
                        ] },
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
                symbol : MainProgram.symbol,
                parameters : { explicit : [
                    {   symbol : ExplicitParameter.symbol,
                        name : { words : [
                            { symbol : BareWord.symbol, text : `f` },
                        ] },
                    },
                ] },
                commands : { list : [
                    {   symbol : CallCommand.symbol,
                        target : {
                            name : { words : [
                                { symbol : BareWord.symbol, text : `f` },
                            ] },
                        },
                    },
                    {   symbol : DeclarationCommand.symbol,
                        name : { words : [
                            { symbol : BareWord.symbol, text : `f` },
                        ] },
                        program : {
                            symbol : DeclaredProgram.symbol,
                            parameters : { explicit : [] },
                            commands : { list : [] },
                        },
                    },
                ] },
            })
        })
        test(`Check call + outputs`, () => {
            expect(parse(
                `f()\n` +
                `x : f()`
            )).toMatchObject({
                symbol : MainProgram.symbol,
                parameters : { explicit : [
                    {   symbol : ExplicitParameter.symbol,
                        name : { words : [
                            { symbol : BareWord.symbol, text : `f` },
                        ] },
                    },
                ] },
                commands : { list : [
                    {   symbol : CallCommand.symbol,
                        target : {
                            name : { words : [
                                { symbol : BareWord.symbol, text : `f` },
                            ] },
                        },
                        outputs : { explicit : [] },
                    },
                    {   symbol : CallCommand.symbol,
                        target : {
                            name : { words : [
                                { symbol : BareWord.symbol, text : `f` },
                            ] },
                        },
                        outputs : { explicit : [
                            { name : { words : [
                                { symbol : BareWord.symbol, text : `x` },
                            ] } },
                        ] },
                    },
                ] },
            })
        })
        test(`Check call + call`, () => {
            expect(parse(
                `f()\n` +
                `f()`
            )).toMatchObject({
                symbol : MainProgram.symbol,
                parameters : { explicit : [
                    {   symbol : ExplicitParameter.symbol,
                        name : { words : [
                            { symbol : BareWord.symbol, text : `f` },
                        ] },
                    },
                ] },
                commands : { list : [
                    {   symbol : CallCommand.symbol,
                        target : {
                            name : { words : [
                                { symbol : BareWord.symbol, text : `f` },
                            ] },
                        },
                        outputs : { explicit : [] },
                    },
                    {   symbol : CallCommand.symbol,
                        target : {
                            name : { words : [
                                { symbol : BareWord.symbol, text : `f` },
                            ] },
                        },
                        outputs : { explicit : [] },
                    },
                ] },
            })
        })
    })
})

describe(`Stress test`, () => {
    const bigNumber = 100

    test(`Check ${bigNumber} calls`, () => {
        let text = ``

        for (let i = 0; i < bigNumber; ++i) {
            text += `some output : some program("some input")\n`
        }

        expect(() => parse(text)).not.toThrow()
    })
    test(`Check ${bigNumber} outputs`, () => {
        let text = ``

        for (let i = 0; i < bigNumber - 1; ++i) {
            text += `some output, `
        }

        text += `some output : some program()`

        expect(() => parse(text)).not.toThrow()
    })
    test(`Check ${bigNumber} inputs`, () => {
        let text = `some program(`

        for (let i = 0; i < bigNumber - 1; ++i) {
            text += `some input, `
        }

        text += `some input)`

        expect(() => parse(text)).not.toThrow()
    })
    test(`Check ${bigNumber} declarations`, () => {
        let text = ``

        for (let i = 0; i < bigNumber; ++i) {
            text += `some program(some input) {\n}\n`
        }

        expect(() => parse(text)).not.toThrow()
    })
    test(`Check ${bigNumber} parameters`, () => {
        let text = `some program(`

        for (let i = 0; i < bigNumber; ++i) {
            text += `some input, `
        }

        text += `some input) {\n}\n`

        expect(() => parse(text)).not.toThrow()
    })
    test(`Check ${bigNumber} nested declarations`, () => {
        let text = ``

        for (let i = 0; i < bigNumber; ++i) {
            text += `some program() {\n`
        }
        for (let i = 0; i < bigNumber; ++i) {
            text += `}\n`
        }

        expect(() => parse(text)).not.toThrow()
    })
})
