export default class Position {
    public readonly Offset : number;
    public readonly Line : number;
    public readonly Column : number;

    public constructor({
        Offset,
        Line,
        Column,
    } : {
        Offset : number,
        Line : number,
        Column : number,
    }) {
        this.Offset = Offset;
        this.Line = Line;
        this.Column = Column;
    }
}
