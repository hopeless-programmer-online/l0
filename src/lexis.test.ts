import { Space, Comment, Delimiter, Name, Block, Locator, Processor, DelimiterType, Opening, Brace, BraceType, BraceDirection, Closing, QuotedWord, BareWord } from './lexis'

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
    const process = (text : string) => {
        const processor = new Processor

        return processor.process(text)
    }

    test(`Check empty string`, () => {
        expect(process(``)).toMatchObject([])
    })
    test(`Check spaces`, () => {
        expect(process(` \n\r`)).toMatchObject([
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
            expect(process(`;abc\n`)).toMatchObject([
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
            expect(process(`;abc`)).toMatchObject([
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
            expect(process(`,`)).toMatchObject([
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
            expect(process(`:`)).toMatchObject([
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
            expect(process(`abc123!@#`)).toMatchObject([
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
                expect(process(`'abc\n\r"123'`)).toMatchObject([
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
                expect(process(`"abc\n\r'123"`)).toMatchObject([
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
            expect(process(`()`)).toMatchObject([
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
            expect(process(`{}`)).toMatchObject([
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
                expect(process(`( \n\r)`)).toMatchObject([
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
                expect(process(`(;a\n)`)).toMatchObject([
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
                expect(process(`(,)`)).toMatchObject([
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
                expect(process(`(a)`)).toMatchObject([
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
                expect(process(`("a")`)).toMatchObject([
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
                expect(process(`({})`)).toMatchObject([
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
            expect(process(` \n\r;abc`)).toMatchObject([
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
            expect(process(` \n\r,`)).toMatchObject([
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
            expect(process(` \n\r:`)).toMatchObject([
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
            expect(process(` "a"`)).toMatchObject([
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
            expect(process(`;abc\n \n\r`)).toMatchObject([
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
            expect(process(`;abc\n,`)).toMatchObject([
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
            expect(process(`;abc\n:`)).toMatchObject([
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
            expect(process(`: `)).toMatchObject([
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
            expect(process(`:"a"`)).toMatchObject([
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
            expect(process(`"a" `)).toMatchObject([
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
            expect(process(`"a";`)).toMatchObject([
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
            expect(process(`"a":`)).toMatchObject([
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
            expect(process(
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
            expect(process(
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
