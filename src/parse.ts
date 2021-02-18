import { Declaration, Name, ReferenceTarget, Execution, Inputs, Command, Parameter } from './front'
import Commands from './front/commands'
import ExplicitParameter from './front/explicit-parameter'
import ImplicitParameter from './front/implicit-parameter'
import Outputs from './front/outputs'
import Parameters from './front/parameters'
import Program from './front/program'
import Reference from './front/reference'
import { Token, Identifier, Comma, Colon, RoundOpening, RoundClosing, CurlyOpening, CurlyClosing } from './text'
import tokenize from './text/tokenize'

export default function parse(source : string) {
    const tokens = tokenize(source)

    let token : Token | null = null

    function move() {
        const { done, value } = tokens.next()

        token = (!done && value) || null
    }

    let globals : Parameter[] = []

    class Scope {
        public parent : Scope | null
        public lookup = new Map<string, ReferenceTarget>()

        public constructor({ parent = null } : { parent? : Scope | null } = {}) {
            this.parent = parent
        }

        private _get(name : string) : ReferenceTarget {
            const { lookup } = this
            const target = lookup.get(name)

            if (target) return target

            const { parent } = this

            if (parent) return parent._get(name)
            if (this !== root) throw new Error

            const parameter = ExplicitParameter.from(name)

            globals.push(parameter)
            lookup.set(name, parameter)

            return parameter
        }

        public add(name : string, target : ReferenceTarget) {
            const { lookup } = this
            const existed = lookup.get(name)

            if (existed) {
                lookup.delete(name)

                this.add(`/${name}`, existed)
            }

            lookup.set(name, target)
        }
        public get(name : string) {
            const target = this._get(name)

            return Reference.from(name, target)
        }
    }

    const root = new Scope
    const sup = ImplicitParameter.from('super')

    root.add('super', sup)
    globals.push(sup)

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
    function parseCommand(first : Identifier, scope : Scope) : { end : boolean, commands : Command[] } {
        move()

        if (token instanceof RoundOpening) {
            const parameters = parseParametersStart()

            move()

            // workaround for typescript to deduce type correctly
            token = (() => token)()

            if (nesting <= 0) {
                if (token === null) {
                    const command = new Execution({
                        target : scope.get(first.value),
                        inputs : Inputs.from(...parameters.map(x => scope.get(x))),
                    })

                    return { end : true, commands : [ command ] }
                }
            }
            else {
                if (token instanceof CurlyClosing) {
                    const command = new Execution({
                        target : scope.get(first.value),
                        inputs : Inputs.from(...parameters.map(x => scope.get(x))),
                    })

                    --nesting

                    return { end : true, commands : [ command ] }
                }
            }

            if (token instanceof Identifier) {
                const command = new Execution({
                    target : scope.get(first.value),
                    inputs : Inputs.from(...parameters.map(x => scope.get(x))),
                })

                const other = parseCommand(token, scope)

                return { end : other.end, commands : [ command, ...other.commands ] }
            }
            else if (token instanceof CurlyOpening) {
                ++nesting

                const command = new Declaration({
                    name : Name.from(first.value),
                })

                scope.add(first.value, command)

                const p = Parameters.from(...parameters)

                for (const x of p) scope.add(x.name.text, x)

                const commands = parseBody(new Scope({ parent : scope })) // @todo: extract commands

                command.program = new Program({
                    parameters : p,
                    commands : Commands.from(...commands),
                })

                return { end : false, commands : [ command ] }
            }

            throw new Error
        }
        else if (token instanceof Colon) {
            move()

            if (!(token instanceof Identifier)) throw new Error('Expecting identifier.')

            const callTarget = token

            move()

            if (!(token instanceof RoundOpening)) throw new Error('Expecting parameters.')

            const parameters = parseParametersStart()
            const command = new Execution({
                target : scope.get(callTarget.value),
                inputs : Inputs.from(...parameters.map(x => scope.get(x))),
                outputs : Outputs.from(first.value),
            })

            for (const x of command.outputs)  scope.add(x.name.text, x)

            return { end : false, commands : [ command ] }
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

            const callTarget = token

            move()

            if (!(token instanceof RoundOpening)) throw new Error('Expecting parameters.')

            const inputs = parseParametersStart()
            const command = new Execution({
                target : scope.get(callTarget.value),
                inputs : Inputs.from(...inputs.map(x => scope.get(x))),
                outputs : Outputs.from(...outputs),
            })

            for (const x of command.outputs)  scope.add(x.name.text, x)

            return { end : false, commands : [ command ] }
        }

        throw new Error('Declaration or execution expected.')
    }
    function parseBody(scope : Scope) {
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

            const body = parseCommand(token, scope)

            commands.push(...body.commands)

            if (body.end) return commands
        }
    }

    const commands = parseBody(root)

    if (token !== null) throw new Error // @todo

    return new Program({
        parameters : new Parameters({ array : globals }),
        commands : new Commands({ array : commands }),
    })
}
