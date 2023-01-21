import { Space, Comment, Delimiter, Name, Block, Locator } from './text'

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

    expect(locator.next()).toMatchObject({ value : `\n` })
    expect(locator.character).toBe(`\n`)
    expect(locator.location).toMatchObject({ offset : 1, row : 0, column : 1 })

    expect(locator.next()).toMatchObject({ value : `b` })
    expect(locator.character).toBe(`b`)
    expect(locator.location).toMatchObject({ offset : 2, row : 1, column : 0 })

    expect(locator.next()).toMatchObject({ value : `\r` })
    expect(locator.character).toBe(`\r`)
    expect(locator.location).toMatchObject({ offset : 3, row : 1, column : 1 })

    expect(locator.next()).toMatchObject({ value : `c` })
    expect(locator.character).toBe(`c`)
    expect(locator.location).toMatchObject({ offset : 4, row : 1, column : 2 })

    expect(locator.next()).toMatchObject({ done : true, value : undefined })
    expect(locator.character).toBe(null)
    expect(locator.location).toMatchObject({ offset : 5, row : 1, column : 3 })

    expect(locator.next()).toMatchObject({ done : true, value : undefined })
    expect(locator.character).toBe(null)
    expect(locator.location).toMatchObject({ offset : 5, row : 1, column : 3 })
})
