export default class Location {
    public readonly offset : number
    public readonly line : number
    public readonly column : number

    public constructor({ offset, line, column } : { offset : number, line : number, column : number }) {
        this.offset = offset
        this.line = line
        this.column = column
    }
}
