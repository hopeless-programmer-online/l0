import Input from "./input";
import Name from "../tokening/name";
import NameToken from "../tokening/name-token";
import Execution from "./execution";
import Command from "./command";
import Program from "./program";

export default class Inputs {
    readonly Execution : Execution;
    readonly Array : Array<Input> = [];

    public constructor({ Execution } : { Execution : Execution }) {
        this.Execution = Execution;
    }

    public Add(name : NameToken | Name | string) {
        let reference = this.Execution.Parent.Scope.TryGet(name);

        // if name is not declared - add parameter to the root program
        if (!reference) {
            let command : Command = this.Execution;
            let program : Program;

            while (true) {
                // search for root program
                let parent = command.Parent;

                while (parent instanceof Command) parent = parent.Parent;

                program = parent.Program;

                // break on program without parent (root)
                if (!program.Parent) break;

                // if program is not root - it should be declared inside declaration
                command = program.Parent;
            }

            program.Parameters.Add(name);

            reference = this.Execution.Parent.Scope.Get(name);
        }

        const output = new Input({ Reference : reference, Index : this.Array.length });

        this.Array.push(output);
    }

    public toString() : string {
        return `(${this.Array.join(`, `)})`;
    }
}
