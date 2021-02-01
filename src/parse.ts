import Commands from './front/commands'
import Parameters from './front/parameters'
import Program from './front/program'
import { Token, Identifier, Comma, Colon, RoundOpening, RoundClosing, SquareOpening, SquareClosing, CurlyOpening, CurlyClosing } from './text'
import tokenize from './text/tokenize'

export default function parse(source : string) {
    const tokens = tokenize(source)

    let token : Token | null = null

    function move() {
        const { done, value } = tokens.next()

        token = (!done && value) || null
    }

    // let globals = []
    let nesting = 0

    function parseParametersStart() {
        move()

        if (token instanceof RoundClosing) return []
        else if (token instanceof Identifier) {
            return parseParametersContinue(token.value)
        }
        else {
            throw new Error('Parameters expected.')
        }
    }
    function parseParametersContinue(first : string) {
        const parameters = [ first ]

        while (true) {
            move()

            if (token instanceof RoundClosing) return parameters
            else if (token instanceof Comma) {
                move()

                if (!(token instanceof Identifier)) throw new Error('Identifier expected')

                parameters.push(token.value)
            }
            else {
                throw new Error('Parameters expected.')
            }
        }
    }
    function parseCommand(first : Identifier) {
        move()

        if (token instanceof RoundOpening) {
            const parameters = parseParametersStart()

            move()
            token = (() => token)()

            if (nesting <= 0) {
                if (token === null) return
            }
            else {
                if (token instanceof CurlyClosing) {
                    --nesting

                    // @todo: add call

                    return
                }
            }

            if (token instanceof Identifier) {
                // @todo: add call

                parseCommand(token)

                return
            }
            else if (token instanceof CurlyOpening) {
                ++nesting

                parseBody()

                // @todo: add declaration

                return
            }

            throw new Error
        }
        else if (token instanceof Colon) {
            move()

            if (!(token instanceof Identifier)) throw new Error('Expecting identifier.')

            move()

            if (!(token instanceof RoundOpening)) throw new Error('Expecting parameters.')

            const parameters = parseParametersStart()

            // @todo: add call

            return
        }
        else if (token instanceof Comma) {
            const outputs = [ first.value ]

            while (true) {
                move()

                if (!(token instanceof Identifier)) throw new Error('Expecting identifier.')

                outputs.push(token.value)
                move()

                if (token instanceof Colon) break
                else if (!(token instanceof Comma)) throw new Error('Expecting comma.')
            }

            move()

            if (!(token instanceof Identifier)) throw new Error('Expecting identifier.')

            move()

            if (!(token instanceof RoundOpening)) throw new Error('Expecting parameters.')

            const inputs = parseParametersStart()

            // @todo: add call

            return
        }

        throw new Error('Declaration or execution expected.')
    }
    function parseBody() {
        while (true) {
            move()

            if (nesting <= 0) {
                if (token === null) return
            }
            else if (token instanceof CurlyClosing) {
                --nesting

                return
            }

            if (!(token instanceof Identifier)) throw new Error('Identifier expected.')

            parseCommand(token)
        }
    }

    parseBody()

    return new Program({
        parameters : new Parameters({
            array : [],
        }),
        commands : new Commands({
            array : [],
        })
    })
}
