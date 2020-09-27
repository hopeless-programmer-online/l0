import Input from "./input";
import Name from "../tokening/name";
import NameToken from "../tokening/name-token";
import Execution from "./execution";
import Command from "./command";
import Program from "./program";
import Parameter from "./parameter";

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

            const programs = [];

            while (true) {
                // search for root program
                let parent = command.Parent;

                while (parent instanceof Command) parent = parent.Parent;

                const program = parent.Program;

                programs.unshift(program);

                // break on program without parent (root)
                if (!program.Parent) break;

                // if program is not root - it should be declared inside declaration
                command = program.Parent;
            }

            let parameter : Parameter = programs[0].Parameters.Add(name);

            for (const program of programs.slice(1)) {
                parameter = program.Parameters.AddStatic(parameter.Reference);
            }

            reference = this.Execution.Parent.Scope.Get(name);
        }

        const output = new Input({ Reference : reference, Index : this.Array.length });

        this.Array.push(output);
    }

    public toString() : string {
        return `(${this.Array.join(`, `)})`;
    }
}
