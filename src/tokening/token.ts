import Position from "./position";

export default abstract class Token {
    public readonly Begin : Position;
    public readonly End : Position;

    public constructor({
        Begin,
        End,
    } : {
        Begin : Position,
        End : Position,
    }) {
        this.Begin = Begin;
        this.End = End;
    }
}
