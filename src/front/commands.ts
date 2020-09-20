import Program from "./program";
import Declaration from "./declaration";
import Command from "./command";
import Name from "../tokening/name-token";
import Scope from "./scope";
import Execution from "./execution";

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
            return this.Program.Parameters.Scope;
        }

        return array[length - 1].Scope;
    }

    public Declare(name : Name | string) : Declaration {
        if (typeof name === `string`) name = Name.Plain(name);

        const parent = this.Array[this.Array.length - 1] || this;
        const command = new Declaration({ Name : name, Parent : parent });

        this.Array.push(command);

        return command;
    }
    public Execute(name : Name | string) : Execution {
        if (typeof name === `string`) name = Name.Plain(name);

        const parent = this.Array[this.Array.length - 1] || this;
        const target = parent.Scope.Get(name);
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
