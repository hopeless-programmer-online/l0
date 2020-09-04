import Instruction from "./instruction";
import TerminalInstruction from "./terminal-instruction";
import ShuffleInstruction from "./shuffle-instruction";
import Source from "./source";
import StaticSource from "./static-source";
import DynamicSource from "./dynamic-source";
import InstructionSource from "./instruction-source";
import SelfSource from "./self-source";

type Buffer = Array<any>;

export default class Machine {
    private buffer : Buffer;
    private done = false;

    constructor({ Buffer } : { Buffer : Buffer }) {
        this.buffer = Buffer;
    }

    public get Buffer() {
        return this.buffer;
    }
    public get Done() {
        return this.done;
    }

    private Fetch(source : Source) {
        if (source instanceof StaticSource) {
            return source.Value;
        }
        else if (source instanceof DynamicSource) {
            return this.buffer[source.Index];
        }
        else if (source instanceof InstructionSource) {
            const instruction = new ShuffleInstruction({
                Sources : source.Sources.map(source => source(this.buffer)),
            });

            instruction.Sources.forEach((source, index) => {
                if (source instanceof SelfSource) {
                    instruction.Sources[index] = new StaticSource({
                        Value : instruction,
                    });
                }
            });

            return instruction;
        }
        // else if (source instanceof SelfSource) {
        //     return null;
        // }
        else {
            throw new Error(`${typeof source}${(source && source.constructor && ` ${source.constructor.name}`) || ``} ${source} is not a source.`);
        }
    }

    public Step() {
        const { buffer } = this;

        if (buffer.length <= 0) throw new Error;

        const instruction = buffer[0];

        // console.log(instruction);

        if (!(instruction instanceof Instruction)) throw new Error(`${typeof instruction}${(instruction && instruction.constructor && ` ${instruction.constructor.name}`) || ``} ${instruction} is not an instruction.`);
        if (instruction instanceof TerminalInstruction) {
            this.done = true;

            return;
        }
        if (!(instruction instanceof ShuffleInstruction)) throw new Error;

        this.buffer = instruction.Sources.map(this.Fetch.bind(this));
    }
}
