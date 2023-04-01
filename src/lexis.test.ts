import { Space, Comment, Delimiter, Name, Block, Locator, Analyzer, DelimiterType, Opening, Brace, BraceType, BraceDirection, Closing, QuotedWord, BareWord } from './lexis'

const parse = (text : string) => {
    const analyzer = new Analyzer

    return analyzer.analyze(text)
}

test(`Check export`, () => {
    expect(Space).toBeDefined()
    expect(Comment).toBeDefined()
    expect(Delimiter).toBeDefined()
    expect(Name).toBeDefined()
    expect(Block).toBeDefined()
})

test(`Check Locator`, () => {
    const text = `a\nb\rc`
    const locator = new Locator({ text })

    expect(locator.character).toBe(`a`)
    expect(locator.location).toMatchObject({ offset : 0, row : 0, column : 0 })

    expect(locator.next).toBe(`\n`)
    expect(locator.character).toBe(`\n`)
    expect(locator.location).toMatchObject({ offset : 1, row : 0, column : 1 })

    expect(locator.next).toBe(`b`)
    expect(locator.character).toBe(`b`)
    expect(locator.location).toMatchObject({ offset : 2, row : 1, column : 0 })

    expect(locator.next).toBe(`\r`)
    expect(locator.character).toBe(`\r`)
    expect(locator.location).toMatchObject({ offset : 3, row : 1, column : 1 })

    expect(locator.next).toBe(`c`)
    expect(locator.character).toBe(`c`)
    expect(locator.location).toMatchObject({ offset : 4, row : 1, column : 2 })

    expect(locator.next).toBe(null)
    expect(locator.character).toBe(null)
    expect(locator.location).toMatchObject({ offset : 5, row : 1, column : 3 })

    expect(locator.next).toBe(null)
    expect(locator.character).toBe(null)
    expect(locator.location).toMatchObject({ offset : 5, row : 1, column : 3 })
})

describe(`Check processor`, () => {
    test(`Check empty string`, () => {
        expect(parse(``)).toMatchObject([])
    })
    test(`Check spaces`, () => {
        expect(parse(` \n\r`)).toMatchObject([
            {   symbol : Space.symbol,
                span : {
                    begin : { offset : 0, row : 0, column : 0 },
                    end : { offset : 3, row : 1, column : 1 },
                },
                text : ` \n\r`,
            },
        ])
    })
    describe(`Check comments`, () => {
        test(`Check newline`, () => {
            expect(parse(`;abc\n`)).toMatchObject([
                {   symbol : Comment.symbol,
                    span : {
                        begin : { offset : 0, row : 0, column : 0 },
                        end : { offset : 5, row : 1, column : 0 },
                    },
                    text : `;abc\n`,
                },
            ])
        })
        test(`Check end of text`, () => {
            expect(parse(`;abc`)).toMatchObject([
                {   symbol : Comment.symbol,
                    span : {
                        begin : { offset : 0, row : 0, column : 0 },
                        end : { offset : 4, row : 0, column : 4 },
                    },
                    text : `;abc`,
                },
            ])
        })
    })
    describe(`Check delimiters`, () => {
        test(`Check ,`, () => {
            expect(parse(`,`)).toMatchObject([
                {   symbol : Delimiter.symbol, type : DelimiterType.Comma,
                    span : {
                        begin : { offset : 0, row : 0, column : 0 },
                        end : { offset : 1, row : 0, column : 1 },
                    },
                    text : `,`,
                },
            ])
        })
        test(`Check :`, () => {
            expect(parse(`:`)).toMatchObject([
                {   symbol : Delimiter.symbol, type : DelimiterType.Colon,
                    span : {
                        begin : { offset : 0, row : 0, column : 0 },
                        end : { offset : 1, row : 0, column : 1 },
                    },
                    text : `:`,
                },
            ])
        })
    })
    describe(`Check names`, () => {
        test(`Check bare`, () => {
            expect(parse(`abc123!@#`)).toMatchObject([
                {   symbol : Name.symbol,
                    parts : [
                        {   symbol : BareWord.symbol,
                            span : {
                                begin : { offset : 0, row : 0, column : 0 },
                                end : { offset : 9, row : 0, column : 9 },
                            },
                            text : `abc123!@#`,
                        },
                    ],
                    span : {
                        begin : { offset : 0, row : 0, column : 0 },
                        end : { offset : 9, row : 0, column : 9 },
                    },
                    text : `abc123!@#`,
                },
            ])
        })
        describe(`Check quoted`, () => {
            test(`Check single quoted`, () => {
                expect(parse(`'abc\n\r"123'`)).toMatchObject([
                    {   symbol : Name.symbol,
                        parts : [
                            {   symbol : QuotedWord.symbol,
                                span : {
                                    begin : { offset : 0, row : 0, column : 0 },
                                    end : { offset : 11, row : 1, column : 6 },
                                },
                                text : `'abc\n\r"123'`,
                                unquoted : `abc\n\r"123`,
                            },
                        ],
                        span : {
                            begin : { offset : 0, row : 0, column : 0 },
                            end : { offset : 11, row : 1, column : 6 },
                        },
                        text : `'abc\n\r"123'`,
                    },
                ])
            })
            test(`Check double quoted`, () => {
                expect(parse(`"abc\n\r'123"`)).toMatchObject([
                    {   symbol : Name.symbol,
                        parts : [
                            {   symbol : QuotedWord.symbol,
                                span : {
                                    begin : { offset : 0, row : 0, column : 0 },
                                    end : { offset : 11, row : 1, column : 6 },
                                },
                                text : `"abc\n\r'123"`,
                                unquoted : `abc\n\r'123`,
                            },
                        ],
                        span : {
                            begin : { offset : 0, row : 0, column : 0 },
                            end : { offset : 11, row : 1, column : 6 },
                        },
                        text : `"abc\n\r'123"`,
                    },
                ])
            })
        })
    })
    describe(`Check blocks`, () => {
        test(`Check ()`, () => {
            expect(parse(`()`)).toMatchObject([
                {   symbol : Block.symbol,
                    opening : {
                        symbol : Opening.symbol, type : BraceType.Round, direction : BraceDirection.Opening,
                        span : {
                            begin : { offset : 0, row : 0, column : 0 },
                            end : { offset : 1, row : 0, column : 1 },
                        },
                        text : `(`,
                    },
                    closing : {
                        symbol : Closing.symbol, type : BraceType.Round, direction : BraceDirection.Closing,
                        span : {
                            begin : { offset : 1, row : 0, column : 1 },
                            end : { offset : 2, row : 0, column : 2 },
                        },
                        text : `)`,
                    },
                    children : [
                    ],
                    span : {
                        begin : { offset : 0, row : 0, column : 0 },
                        end : { offset : 2, row : 0, column : 2 },
                    },
                    text : `()`,
                },
            ])
        })
        test(`Check {}`, () => {
            expect(parse(`{}`)).toMatchObject([
                {   symbol : Block.symbol,
                    opening : {
                        symbol : Opening.symbol, type : BraceType.Figure, direction : BraceDirection.Opening,
                        span : {
                            begin : { offset : 0, row : 0, column : 0 },
                            end : { offset : 1, row : 0, column : 1 },
                        },
                        text : `{`,
                    },
                    closing : {
                        symbol : Closing.symbol, type : BraceType.Figure, direction : BraceDirection.Closing,
                        span : {
                            begin : { offset : 1, row : 0, column : 1 },
                            end : { offset : 2, row : 0, column : 2 },
                        },
                        text : `}`,
                    },
                    children : [
                    ],
                    span : {
                        begin : { offset : 0, row : 0, column : 0 },
                        end : { offset : 2, row : 0, column : 2 },
                    },
                    text : `{}`,
                },
            ])
        })
        describe(`Check children`, () => {
            test(`Check space`, () => {
                expect(parse(`( \n\r)`)).toMatchObject([
                    {   symbol : Block.symbol,
                        opening : {
                            symbol : Opening.symbol, type : BraceType.Round, direction : BraceDirection.Opening,
                            span : {
                                begin : { offset : 0, row : 0, column : 0 },
                                end : { offset : 1, row : 0, column : 1 },
                            },
                            text : `(`,
                        },
                        closing : {
                            symbol : Closing.symbol, type : BraceType.Round, direction : BraceDirection.Closing,
                            span : {
                                begin : { offset : 4, row : 1, column : 1 },
                                end : { offset : 5, row : 1, column : 2 },
                            },
                            text : `)`,
                        },
                        children : [
                            {   symbol : Space.symbol,
                                span : {
                                    begin : { offset : 1, row : 0, column : 1 },
                                    end : { offset : 4, row : 1, column : 1 },
                                },
                                text : ` \n\r`,
                            },
                        ],
                        span : {
                            begin : { offset : 0, row : 0, column : 0 },
                            end : { offset : 5, row : 1, column : 2 },
                        },
                        text : `( \n\r)`,
                    },
                ])
            })
            test(`Check comment`, () => {
                expect(parse(`(;a\n)`)).toMatchObject([
                    {   symbol : Block.symbol,
                        opening : {
                            symbol : Opening.symbol, type : BraceType.Round, direction : BraceDirection.Opening,
                            span : {
                                begin : { offset : 0, row : 0, column : 0 },
                                end : { offset : 1, row : 0, column : 1 },
                            },
                            text : `(`,
                        },
                        closing : {
                            symbol : Closing.symbol, type : BraceType.Round, direction : BraceDirection.Closing,
                            span : {
                                begin : { offset : 4, row : 1, column : 0 },
                                end : { offset : 5, row : 1, column : 1 },
                            },
                            text : `)`,
                        },
                        children : [
                            {   symbol : Comment.symbol,
                                span : {
                                    begin : { offset : 1, row : 0, column : 1 },
                                    end : { offset : 4, row : 1, column : 0 },
                                },
                                text : `;a\n`,
                            },
                        ],
                        span : {
                            begin : { offset : 0, row : 0, column : 0 },
                            end : { offset : 5, row : 1, column : 1 },
                        },
                        text : `(;a\n)`,
                    },
                ])
            })
            test(`Check delimiter`, () => {
                expect(parse(`(,)`)).toMatchObject([
                    {   symbol : Block.symbol,
                        opening : {
                            symbol : Opening.symbol, type : BraceType.Round, direction : BraceDirection.Opening,
                            span : {
                                begin : { offset : 0, row : 0, column : 0 },
                                end : { offset : 1, row : 0, column : 1 },
                            },
                            text : `(`,
                        },
                        closing : {
                            symbol : Closing.symbol, type : BraceType.Round, direction : BraceDirection.Closing,
                            span : {
                                begin : { offset : 2, row : 0, column : 2 },
                                end : { offset : 3, row : 0, column : 3 },
                            },
                            text : `)`,
                        },
                        children : [
                            {   symbol : Delimiter.symbol, type : DelimiterType.Comma,
                                span : {
                                    begin : { offset : 1, row : 0, column : 1 },
                                    end : { offset : 2, row : 0, column : 2 },
                                },
                                text : `,`,
                            },
                        ],
                        span : {
                            begin : { offset : 0, row : 0, column : 0 },
                            end : { offset : 3, row : 0, column : 3 },
                        },
                        text : `(,)`,
                    },
                ])
            })
            test(`Check bare name`, () => {
                expect(parse(`(a)`)).toMatchObject([
                    {   symbol : Block.symbol,
                        opening : {
                            symbol : Opening.symbol, type : BraceType.Round, direction : BraceDirection.Opening,
                            span : {
                                begin : { offset : 0, row : 0, column : 0 },
                                end : { offset : 1, row : 0, column : 1 },
                            },
                            text : `(`,
                        },
                        closing : {
                            symbol : Closing.symbol, type : BraceType.Round, direction : BraceDirection.Closing,
                            span : {
                                begin : { offset : 2, row : 0, column : 2 },
                                end : { offset : 3, row : 0, column : 3 },
                            },
                            text : `)`,
                        },
                        children : [
                            {   symbol : Name.symbol,
                                parts : [
                                    {   symbol : BareWord.symbol,
                                        span : {
                                            begin : { offset : 1, row : 0, column : 1 },
                                            end : { offset : 2, row : 0, column : 2 },
                                        },
                                        text : `a`,
                                    },
                                ],
                                span : {
                                    begin : { offset : 1, row : 0, column : 1 },
                                    end : { offset : 2, row : 0, column : 2 },
                                },
                                text : `a`,
                            },
                        ],
                        span : {
                            begin : { offset : 0, row : 0, column : 0 },
                            end : { offset : 3, row : 0, column : 3 },
                        },
                        text : `(a)`,
                    },
                ])
            })
            test(`Check quoted name`, () => {
                expect(parse(`("a")`)).toMatchObject([
                    {   symbol : Block.symbol,
                        opening : {
                            symbol : Opening.symbol, type : BraceType.Round, direction : BraceDirection.Opening,
                            span : {
                                begin : { offset : 0, row : 0, column : 0 },
                                end : { offset : 1, row : 0, column : 1 },
                            },
                            text : `(`,
                        },
                        closing : {
                            symbol : Closing.symbol, type : BraceType.Round, direction : BraceDirection.Closing,
                            span : {
                                begin : { offset : 4, row : 0, column : 4 },
                                end : { offset : 5, row : 0, column : 5 },
                            },
                            text : `)`,
                        },
                        children : [
                            {   symbol : Name.symbol,
                                parts : [
                                    {   symbol : QuotedWord.symbol,
                                        span : {
                                            begin : { offset : 1, row : 0, column : 1 },
                                            end : { offset : 4, row : 0, column : 4 },
                                        },
                                        text : `"a"`,
                                        unquoted : `a`,
                                    },
                                ],
                                span : {
                                    begin : { offset : 1, row : 0, column : 1 },
                                    end : { offset : 4, row : 0, column : 4 },
                                },
                                text : `"a"`,
                            },
                        ],
                        span : {
                            begin : { offset : 0, row : 0, column : 0 },
                            end : { offset : 5, row : 0, column : 5 },
                        },
                        text : `("a")`,
                    },
                ])
            })
            test(`Check block`, () => {
                expect(parse(`({})`)).toMatchObject([
                    {   symbol : Block.symbol,
                        opening : {
                            symbol : Opening.symbol, type : BraceType.Round, direction : BraceDirection.Opening,
                            span : {
                                begin : { offset : 0, row : 0, column : 0 },
                                end : { offset : 1, row : 0, column : 1 },
                            },
                            text : `(`,
                        },
                        closing : {
                            symbol : Closing.symbol, type : BraceType.Round, direction : BraceDirection.Closing,
                            span : {
                                begin : { offset : 3, row : 0, column : 3 },
                                end : { offset : 4, row : 0, column : 4 },
                            },
                            text : `)`,
                        },
                        children : [
                            {   symbol : Block.symbol,
                                opening : {
                                    symbol : Opening.symbol, type : BraceType.Figure, direction : BraceDirection.Opening,
                                    span : {
                                        begin : { offset : 1, row : 0, column : 1 },
                                        end : { offset : 2, row : 0, column : 2 },
                                    },
                                    text : `{`,
                                },
                                closing : {
                                    symbol : Closing.symbol, type : BraceType.Figure, direction : BraceDirection.Closing,
                                    span : {
                                        begin : { offset : 2, row : 0, column : 2 },
                                        end : { offset : 3, row : 0, column : 3 },
                                    },
                                    text : `}`,
                                },
                                children : [
                                ],
                                span : {
                                    begin : { offset : 1, row : 0, column : 1 },
                                    end : { offset : 3, row : 0, column : 3 },
                                },
                                text : `{}`,
                            },
                        ],
                        span : {
                            begin : { offset : 0, row : 0, column : 0 },
                            end : { offset : 4, row : 0, column : 4 },
                        },
                        text : `({})`,
                    },
                ])
            })
        })
    })
    describe(`Check combinations`, () => {
        test(`Check space + comment`, () => {
            expect(parse(` \n\r;abc`)).toMatchObject([
                {   symbol : Space.symbol,
                    span : {
                        begin : { offset : 0, row : 0, column : 0 },
                        end : { offset : 3, row : 1, column : 1 },
                    },
                    text : ` \n\r`,
                },
                {   symbol : Comment.symbol,
                    span : {
                        begin : { offset : 3, row : 1, column : 1 },
                        end : { offset : 7, row : 1, column : 5 },
                    },
                    text : `;abc`,
                },
            ])
        })
        test(`Check space + ,`, () => {
            expect(parse(` \n\r,`)).toMatchObject([
                {   symbol : Space.symbol,
                    span : {
                        begin : { offset : 0, row : 0, column : 0 },
                        end : { offset : 3, row : 1, column : 1 },
                    },
                    text : ` \n\r`,
                },
                {   symbol : Delimiter.symbol, type : DelimiterType.Comma,
                    span : {
                        begin : { offset : 3, row : 1, column : 1 },
                        end : { offset : 4, row : 1, column : 2 },
                    },
                    text : `,`,
                },
            ])
        })
        test(`Check space + :`, () => {
            expect(parse(` \n\r:`)).toMatchObject([
                {   symbol : Space.symbol,
                    span : {
                        begin : { offset : 0, row : 0, column : 0 },
                        end : { offset : 3, row : 1, column : 1 },
                    },
                    text : ` \n\r`,
                },
                {   symbol : Delimiter.symbol, type : DelimiterType.Colon,
                    span : {
                        begin : { offset : 3, row : 1, column : 1 },
                        end : { offset : 4, row : 1, column : 2 },
                    },
                    text : `:`,
                },
            ])
        })
        test(`Check space + quoted name`, () => {
            expect(parse(` "a"`)).toMatchObject([
                {   symbol : Space.symbol,
                    span : {
                        begin : { offset : 0, row : 0, column : 0 },
                        end : { offset : 1, row : 0, column : 1 },
                    },
                    text : ` `,
                },
                {   symbol : Name.symbol,
                    parts : [
                        {   symbol : QuotedWord.symbol,
                            span : {
                                begin : { offset : 1, row : 0, column : 1 },
                                end : { offset : 4, row : 0, column : 4 },
                            },
                            text : `"a"`,
                            unquoted : `a`,
                        },
                    ],
                    span : {
                        begin : { offset : 1, row : 0, column : 1 },
                        end : { offset : 4, row : 0, column : 4 },
                    },
                    text : `"a"`,
                },
            ])
        })
        test(`Check comment + space`, () => {
            expect(parse(`;abc\n \n\r`)).toMatchObject([
                {   symbol : Comment.symbol,
                    span : {
                        begin : { offset : 0, row : 0, column : 0 },
                        end : { offset : 5, row : 1, column : 0 },
                    },
                    text : `;abc\n`,
                },
                {   symbol : Space.symbol,
                    span : {
                        begin : { offset : 5, row : 1, column : 0 },
                        end : { offset : 8, row : 2, column : 1 },
                    },
                    text : ` \n\r`,
                },
            ])
        })
        test(`Check comment + ,`, () => {
            expect(parse(`;abc\n,`)).toMatchObject([
                {   symbol : Comment.symbol,
                    span : {
                        begin : { offset : 0, row : 0, column : 0 },
                        end : { offset : 5, row : 1, column : 0 },
                    },
                    text : `;abc\n`,
                },
                {   symbol : Delimiter.symbol, type : DelimiterType.Comma,
                    span : {
                        begin : { offset : 5, row : 1, column : 0 },
                        end : { offset : 6, row : 1, column : 1 },
                    },
                    text : `,`,
                },
            ])
        })
        test(`Check comment + :`, () => {
            expect(parse(`;abc\n:`)).toMatchObject([
                {   symbol : Comment.symbol,
                    span : {
                        begin : { offset : 0, row : 0, column : 0 },
                        end : { offset : 5, row : 1, column : 0 },
                    },
                    text : `;abc\n`,
                },
                {   symbol : Delimiter.symbol, type : DelimiterType.Colon,
                    span : {
                        begin : { offset : 5, row : 1, column : 0 },
                        end : { offset : 6, row : 1, column : 1 },
                    },
                    text : `:`,
                },
            ])
        })
        test(`Check delimiter + space`, () => {
            expect(parse(`: `)).toMatchObject([
                {   symbol : Delimiter.symbol, type : DelimiterType.Colon,
                    span : {
                        begin : { offset : 0, row : 0, column : 0 },
                        end : { offset : 1, row : 0, column : 1 },
                    },
                    text : `:`,
                },
                {   symbol : Space.symbol,
                    span : {
                        begin : { offset : 1, row : 0, column : 1 },
                        end : { offset : 2, row : 0, column : 2 },
                    },
                    text : ` `,
                },
            ])
        })
        test(`Check delimiter + quoted name`, () => {
            expect(parse(`:"a"`)).toMatchObject([
                {   symbol : Delimiter.symbol, type : DelimiterType.Colon,
                    span : {
                        begin : { offset : 0, row : 0, column : 0 },
                        end : { offset : 1, row : 0, column : 1 },
                    },
                    text : `:`,
                },
                {   symbol : Name.symbol,
                    parts : [
                        {   symbol : QuotedWord.symbol,
                            span : {
                                begin : { offset : 1, row : 0, column : 1 },
                                end : { offset : 4, row : 0, column : 4 },
                            },
                            text : `"a"`,
                            unquoted : `a`,
                        },
                    ],
                    span : {
                        begin : { offset : 1, row : 0, column : 1 },
                        end : { offset : 4, row : 0, column : 4 },
                    },
                    text : `"a"`,
                },
            ])
        })
        test(`Check quoted name + space`, () => {
            expect(parse(`"a" `)).toMatchObject([
                {   symbol : Name.symbol,
                    parts : [
                        {   symbol : QuotedWord.symbol,
                            span : {
                                begin : { offset : 0, row : 0, column : 0 },
                                end : { offset : 3, row : 0, column : 3 },
                            },
                            text : `"a"`,
                            unquoted : `a`,
                        },
                    ],
                    span : {
                        begin : { offset : 0, row : 0, column : 0 },
                        end : { offset : 3, row : 0, column : 3 },
                    },
                    text : `"a"`,
                },
                {   symbol : Space.symbol,
                    span : {
                        begin : { offset : 3, row : 0, column : 3 },
                        end : { offset : 4, row : 0, column : 4 },
                    },
                    text : ` `,
                },
            ])
        })
        test(`Check quoted name + comment`, () => {
            expect(parse(`"a";`)).toMatchObject([
                {   symbol : Name.symbol,
                    parts : [
                        {   symbol : QuotedWord.symbol,
                            span : {
                                begin : { offset : 0, row : 0, column : 0 },
                                end : { offset : 3, row : 0, column : 3 },
                            },
                            text : `"a"`,
                            unquoted : `a`,
                        },
                    ],
                    span : {
                        begin : { offset : 0, row : 0, column : 0 },
                        end : { offset : 3, row : 0, column : 3 },
                    },
                    text : `"a"`,
                },
                {   symbol : Comment.symbol,
                    span : {
                        begin : { offset : 3, row : 0, column : 3 },
                        end : { offset : 4, row : 0, column : 4 },
                    },
                    text : `;`,
                },
            ])
        })
        test(`Check quoted name + delimiter`, () => {
            expect(parse(`"a":`)).toMatchObject([
                {   symbol : Name.symbol,
                    parts : [
                        {   symbol : QuotedWord.symbol,
                            span : {
                                begin : { offset : 0, row : 0, column : 0 },
                                end : { offset : 3, row : 0, column : 3 },
                            },
                            text : `"a"`,
                            unquoted : `a`,
                        },
                    ],
                    span : {
                        begin : { offset : 0, row : 0, column : 0 },
                        end : { offset : 3, row : 0, column : 3 },
                    },
                    text : `"a"`,
                },
                {   symbol : Delimiter.symbol, type : DelimiterType.Colon,
                    span : {
                        begin : { offset : 3, row : 0, column : 3 },
                        end : { offset : 4, row : 0, column : 4 },
                    },
                    text : `:`,
                },
            ])
        })
    })
    describe(`Check for smoke`, () => {
        test(`Hello, World!`, () => {
            expect(parse(
                `print("Hello, World!")`
            )).toMatchObject([
                {   symbol : Name.symbol,
                    parts : [
                        { symbol : BareWord.symbol, text : `print` },
                    ],
                },
                {   symbol : Block.symbol,
                    opening : { symbol : Opening.symbol, text : `(` },
                    children : [
                        {   symbol : Name.symbol,
                            parts : [
                                { symbol : QuotedWord.symbol, text : `"Hello, World!"`, unquoted : `Hello, World!` },
                            ],
                        },
                    ],
                    closing : { symbol : Closing.symbol, text : `)` },
                },
            ])
        })
        test(`Generic program call`, () => {
            expect(parse(
                `u, v, w : f(x, y, z)`
            )).toMatchObject([
                {   symbol : Name.symbol, text : `u` },
                {   symbol : Delimiter.symbol, text : `,` },
                {   symbol : Space.symbol, text : ` ` },
                {   symbol : Name.symbol, text : `v` },
                {   symbol : Delimiter.symbol, text : `,` },
                {   symbol : Space.symbol, text : ` ` },
                {   symbol : Name.symbol, text : `w` },
                {   symbol : Space.symbol, text : ` ` },
                {   symbol : Delimiter.symbol, text : `:` },
                {   symbol : Space.symbol, text : ` ` },
                {   symbol : Name.symbol, text : `f` },
                {   symbol : Block.symbol,
                    opening : { symbol : Opening.symbol, text : `(` },
                    children : [
                        {   symbol : Name.symbol, text : `x` },
                        {   symbol : Delimiter.symbol, text : `,` },
                        {   symbol : Space.symbol, text : ` ` },
                        {   symbol : Name.symbol, text : `y` },
                        {   symbol : Delimiter.symbol, text : `,` },
                        {   symbol : Space.symbol, text : ` ` },
                        {   symbol : Name.symbol, text : `z` },
                    ],
                    closing : { symbol : Closing.symbol, text : `)` },
                },
            ])
        })
    })
})

describe(`Stress test`, () => {
    const bigNumber = 100_000

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
