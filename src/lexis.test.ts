import { Space, Comment, Delimiter, Name, Block, Locator, Processor } from './lexis'

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
})
