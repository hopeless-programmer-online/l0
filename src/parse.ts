import { Declaration, Name, ReferenceTarget, Execution, Inputs, Command, Parameter } from './front'
import Commands from './front/commands'
import ExplicitParameter from './front/explicit-parameter'
import ImplicitParameter from './front/implicit-parameter'
import Output from './front/output'
import Outputs from './front/outputs'
import Parameters from './front/parameters'
import Program from './front/program'
import Reference from './front/reference'
import { Comment, Token, Identifier, Comma, Colon, RoundOpening, RoundClosing, CurlyOpening, CurlyClosing } from './text'
import tokenize from './text/tokenize'

export default function parse(source : Generator<Token> | string) {
    const tokens = typeof source === 'string'
        ? tokenize(source)
        : source

    let token : Token | null = null

    function move() {
        while (true) {
            const { done, value } = tokens.next()

            if (value instanceof Comment) continue

            token = (!done && value) || null

            break
        }
    }

    let globals : Parameter[] = []

    class Scope {
        public static from(target : ReferenceTarget, parent : Scope | null = null) {
            const reference = target && Reference.from(target.name.text, target)

            return new Scope({ reference, parent })
        }

        public _parent : Scope | null
        public readonly reference : Reference | null

        public constructor({ parent = null, reference = null } : { parent? : Scope | null, reference? : Reference | null } = {}) {
            this._parent = parent
            this.reference = reference
        }

        public get parent() {
            return this._parent
        }
        public get targets() {
            const map = new Map<string, ReferenceTarget>()
            let scope : Scope | null = this

            while (scope) {
                const { reference } = scope

                if (reference) {
                    const { name, target } = reference
                    let { text } = name

                    while (map.has(text)) text = `/${text}`

                    map.set(text, target)
                }

                scope = scope.parent
            }

            return map
        }

        public get(text : string) {
            const { targets } = this
            const target = targets.get(text)

            if (target) return Reference.from(text, target)

            const parameter = ExplicitParameter.from(text)

            globals.push(parameter)

            const scope = Scope.from(parameter, root.parent)

            root._parent = scope

            // workaround for reference type deduction
            return scope.reference as Reference
        }
    }

    const sup = ImplicitParameter.from('super')
    const supScope = Scope.from(sup)

    globals.push(sup)

    const root = new Scope({ parent : supScope })

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
    function parseCommand(first : Identifier, scope : Scope) : { end : boolean, commands : Command[], scope : Scope } {
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

                    return { end : true, commands : [ command ], scope }
                }
            }
            else {
                if (token instanceof CurlyClosing) {
                    const command = new Execution({
                        target : scope.get(first.value),
                        inputs : Inputs.from(...parameters.map(x => scope.get(x))),
                    })

                    --nesting

                    return { end : true, commands : [ command ], scope }
                }
            }

            if (token instanceof Identifier) {
                const command = new Execution({
                    target : scope.get(first.value),
                    inputs : Inputs.from(...parameters.map(x => scope.get(x))),
                })

                const other = parseCommand(token, scope)

                return { end : other.end, commands : [ command, ...other.commands ], scope : other.scope }
            }
            else if (token instanceof CurlyOpening) {
                ++nesting

                const command = new Declaration({
                    name : Name.from(first.value),
                })

                scope = Scope.from(command, scope)

                const p = Parameters.from(...parameters)
                let s = new Scope({ parent : scope })

                for (const x of p) s = Scope.from(x, s)

                const commands = parseBody(s) // @todo: extract commands

                command.program = new Program({
                    parameters : p,
                    commands : Commands.from(...commands),
                })

                return { end : false, commands : [ command ], scope }
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

            for (const x of command.outputs) scope = Scope.from(x, scope)

            return { end : false, commands : [ command ], scope }
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

            for (const x of command.outputs) scope = Scope.from(x, scope)

            return { end : false, commands : [ command ], scope }
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

            scope = body.scope
        }
    }

    const commands = parseBody(root)

    if (token !== null) throw new Error // @todo

    return new Program({
        parameters : new Parameters({ array : globals }),
        commands : new Commands({ array : commands }),
    })
}
