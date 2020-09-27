import Program from "./program";
import Declaration from "./declaration";
import Command from "./command";
import Name from "../tokening/name";
import NameToken from "../tokening/name-token";
import Scope from "./scope";
import Execution from "./execution";
import Parameter from "./parameter";

export default class Commands {
    readonly Program : Program;
    readonly Array : Array<Command> = [];

    public constructor({ Program } : { Program : Program }) {
        this.Program = Program;
    }

    public get Scope() : Scope {
        const array = this.Array;
        const { length } = array;

        if (length <= 0) {
            return this.Program.Parameters.ExplicitScope;
        }

        return array[length - 1].Scope;
    }

    public Declare(name : NameToken | Name | string) : Declaration {
        if (typeof name === `string`) name = Name.Plain(name);
        if (name instanceof NameToken) name = name.Name;

        const parent = this.Array[this.Array.length - 1] || this;
        const command = new Declaration({ Name : name, Parent : parent });

        this.Array.push(command);

        return command;
    }
    public Execute(name : NameToken | Name | string) : Execution {
        if (typeof name === `string`) name = Name.Plain(name);
        if (name instanceof NameToken) name = name.Name;

        const parent = this.Array[this.Array.length - 1] || this;

        let target = parent.Scope.TryGet(name);

        // if name is not declared - add parameter to the root program
        if (!target) {
            const programs = [ this.Program ];

            // let program = this.Program;

            while (true) {
                const program = programs[0];

                if (!program.Parent) break;

                let command : Commands | Command = program.Parent;

                while (true) {
                    command = command.Parent;

                    if (command instanceof Commands) break;
                }

                programs.unshift(command.Program);
            }

            let parameter : Parameter = programs[0].Parameters.Add(name);

            for (const program of programs.slice(1)) {
                parameter = program.Parameters.AddStatic(parameter.Reference);
            }

            target = parent.Scope.Get(name);
        }

        const command = new Execution({ Target : target, Parent : parent });

        this.Array.push(command);

        return command;
    }

    public toString() : string {
        return `{${
            this.Array
                .map(command => `\n${command}`).join(``)
                .replace(/\n/g, `\n\t`)
        }\n}`;
    }
}
