import Command from "./command";
import Scope from "./scope";
import Commands from "./commands";
import Name from "./name";
import DeclarationReference from "./declaration-reference";
import { Program } from "../front";

export default class Declaration extends Command {
    readonly Scope : Scope;
    readonly Name : Name;
    readonly Program : Program;

    public constructor({ Commands, Parent, Name, Program } : { Commands : Commands, Parent : Scope, Name : Name, Program : Program }) {
        super({ Commands });

        this.Scope = new Scope({
            Parent,
            Reference : new DeclarationReference({
                Declaration : this,
                Name,
            }),
        });
        this.Name = Name;
        this.Program = Program;
    }

    public toString() : string {
        return `${this.Name} ${this.Program}`;
    }
}
