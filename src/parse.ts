import { Declaration, Name, ReferenceTarget, Execution, Inputs, Command, Parameter } from './front'
import Commands from './front/commands'
import ExplicitParameter from './front/explicit-parameter'
import Parameters from './front/parameters'
import Program from './front/program'
import Reference from './front/reference'
import { Token, Identifier, Comma, Colon, RoundOpening, RoundClosing, CurlyOpening, CurlyClosing } from './text'
import tokenize from './text/tokenize'

type Lookup = Map<string, ReferenceTarget>

export default function parse(source : string) {
    const tokens = tokenize(source)

    let token : Token | null = null

    function move() {
        const { done, value } = tokens.next()

        token = (!done && value) || null
    }

    let globals : Parameter[] = []
    let nesting = 0

    function getReference(text : string, lookup : Lookup) {
        let target = lookup.get(text)

        if (!target) {
            target = ExplicitParameter.From(text)

            globals.push(target)
        }

        return Reference.From(text, target)
    }
    function addReference(text : string, target : ReferenceTarget, lookup : Lookup) {
        const existed = lookup.get(text)

        if (existed) {
            lookup.delete(text)
            addReference(`/${text}`, existed, lookup)
        }

        lookup.set(text, target)
    }
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
    function parseCommand(first : Identifier, lookup : Lookup) : Command[] {
        move()

        if (token instanceof RoundOpening) {
            const parameters = parseParametersStart()

            move()
            token = (() => token)()

            if (nesting <= 0) {
                if (token === null) {
                    const command = new Execution({
                        target : getReference(first.value, lookup),
                        inputs : Inputs.From(...parameters.map(x => getReference(x, lookup))),
                    })

                    return [ command ]
                }
            }
            else {
                if (token instanceof CurlyClosing) {
                    const command = new Execution({
                        target : getReference(first.value, lookup),
                        inputs : Inputs.From(...parameters.map(x => getReference(x, lookup))),
                    })

                    --nesting

                    return [ command ]
                }
            }

            if (token instanceof Identifier) {
                const command = new Execution({
                    target : getReference(first.value, lookup),
                    inputs : Inputs.From(...parameters.map(x => getReference(x, lookup))),
                })

                const other = parseCommand(token, lookup)

                return [ command, ...other ]
            }
            else if (token instanceof CurlyOpening) {
                ++nesting

                const command = new Declaration({
                    name : Name.From(first.value),
                })

                addReference(first.value, command, lookup)

                const commands = parseBody(new Map([ ...lookup ])) // @todo: extract commands

                command.program = new Program({
                    parameters : Parameters.From(...parameters),
                    commands : Commands.From(...commands),
                })

                return [ command ]
            }

            throw new Error
        }
        else if (token instanceof Colon) {
            move()

            if (!(token instanceof Identifier)) throw new Error('Expecting identifier.')

            move()

            if (!(token instanceof RoundOpening)) throw new Error('Expecting parameters.')

            const parameters = parseParametersStart()
            const command = new Execution({
                target : getReference(first.value, lookup),
                inputs : Inputs.From(...parameters.map(x => getReference(x, lookup))),
            })

            return [ command ]
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
            const command = new Execution({
                target : getReference(first.value, lookup),
                inputs : Inputs.From(...inputs.map(x => getReference(x, lookup))),
            })

            return [ command ]
        }

        throw new Error('Declaration or execution expected.')
    }
    function parseBody(lookup : Lookup = new Map) {
        const commands : Command[] = []

        while (true) {
            move()

            if (nesting <= 0) {
                if (token === null) return commands
            }
            else if (token instanceof CurlyClosing) {
                --nesting

                return commands
            }

            if (!(token instanceof Identifier)) throw new Error('Identifier expected.')

            commands.push( ...parseCommand(token, lookup) )
        }
    }

    const commands = parseBody()

    return new Program({
        parameters : new Parameters({ array : globals }),
        commands : new Commands({ array : commands }),
    })
}
