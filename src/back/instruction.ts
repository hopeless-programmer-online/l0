export default abstract class Instruction {
    private static FromCommands(commands : Array<Command>, state : State) : Instruction {
        if (commands.length === 0) {
            // console.log(util.inspect(state, { depth : 1 }));

            const index = state.findIndex(something => something instanceof SuperParameter);

            // console.log(index);

            if (index === -1) throw new Error(`Failed to find super in ${state}.`);

            return new ShuffleInstruction({
                Sources : [
                    new DynamicSource({ Index : index }),
                    // super as sub @todo: rework?
                    new DynamicSource({ Index : index }),
                ],
            });
        }

        const command = commands[0];

        if (command instanceof Declaration) {
            const instruction = Instruction.FromProgram(command.Program, state);
            const next = Instruction.FromCommands(commands.slice(1), [ ...state, command ]);

            return new ShuffleInstruction({
                Sources : [
                    // next command
                    new StaticSource({ Value : next }),
                    // existed
                    /**
                     * No need to copy the first cell - current instruction. So we can start from the seconds cell (+1).
                     */
                    ...Array.from(state.slice(1).keys()).map(index => new DynamicSource({ Index : index + 1 })),
                    // declared
                    instruction,
                ],
            });
        }
        else if (command instanceof Execution) {
            const target = state.findIndex(something => something === command.Target.Target);

            if (target === -1) throw new Error;

            const next = Instruction.FromCommands(commands.slice(1), [ ...state, ...command.Outputs.Array ]);

            return new ShuffleInstruction({
                Sources : [
                    // call target
                    new DynamicSource({ Index : target }),
                    // super
                    new InstructionSource({
                        Sources : [
                            // next command
                            () => new StaticSource({ Value : next }),
                            // restore saved context
                            ...Array.from(state.slice(1).keys()).map(index =>
                                (buffer : Array<any>) => new StaticSource({ Value : buffer[index + 1] }),
                            ),
                            // move outputs
                            ...Array.from(command.Outputs.Array.keys()).map(index =>
                                () => new DynamicSource({ Index : index + 1 }),
                            ),
                        ],
                    }),
                    // inputs
                    ...command.Inputs.Array.map(input => {
                        const index = state.findIndex(something => input.Reference.Target === something);

                        if (index === -1) throw new Error;

                        return new DynamicSource({ Index : index });
                    }),
                ],
            });
        }
        else {
            throw new Error; // @todo
        }
    }
    private static FromProgram(program : Program, state : State) : InstructionSource {
        const parameters = program.Parameters;
        const first = Instruction.FromCommands(program.Commands.Array, [
            null, // current instruction
            // ...(program.Parent ? [] : [ null ]),
            ...parameters,
        ]);

        return new InstructionSource({
            Sources : [
                // first instruction
                () => new StaticSource({ Value : first }),
                // restore saved static parameters
                ...parameters.Static.map(parameter => {
                    const target = parameter.Target.Target;

                    if (target instanceof Declaration) {
                        if (target.Program === program) {
                            return (buffer : Array<any>) => new SelfSource;
                        }
                    }

                    const index = state.findIndex(something => something === target);

                    if (index === -1) throw new Error(`Failed to find ${target} in ${state}.`);

                    return (buffer : Array<any>) => new StaticSource({ Value : buffer[index] });
                }),
                // move dynamic parameters
                ...Array.from(parameters.Dynamic.keys()).map(index =>
                    /**
                     * At the moment when the control is passed into the program, the very first value
                     * inside the buffer will be the current instruction. So, we need to add 1 to the
                     * source index to gather values starting from the second cell.
                     */
                    () => new DynamicSource({ Index : index + 1 }),
                ),
                // move explicit parameters
                ...Array.from(parameters.Explicit.keys()).map(index =>
                    () => new DynamicSource({ Index : index + parameters.Dynamic.length + 1 }),
                ),
            ],
        });
    }

    public static From(program : Program, globals : Array<any> = []) {
        return new ShuffleInstruction({
            Sources : [
                Instruction.FromProgram(program, []),
                new StaticSource({ Value : new TerminalInstruction }),
                ...globals.map(value => new StaticSource({ Value : value })),
            ],
        });
    }
}

import util from "util";
import Program from "../front/program";
import Parameter from "../front/parameter";
import Declaration from "../front/declaration";
import ShuffleInstruction from "./shuffle-instruction";
import DynamicSource from "./dynamic-source";
import Output from "../front/output";
import InstructionSource from "./instruction-source";
import StaticSource from "./static-source";
import Command from "../front/command";
import SuperParameter from "../front/super-parameter";
import Execution from "../front/execution";
import SelfSource from "./self-source";
import TerminalInstruction from "./terminal-instruction";

type State = Array<Declaration | Parameter | Output | null>;
