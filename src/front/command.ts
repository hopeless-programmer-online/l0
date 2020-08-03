import Commands from "./commands";

export default abstract class Command {
    readonly Commands : Commands;

    public constructor({ Commands } : { Commands : Commands }) {
        this.Commands = Commands;
    }
}
