import Location from './location'

export default abstract class Token {
    public readonly begin : Location
    public readonly end : Location

    public constructor({ begin, end } : { begin : Location, end : Location }) {
        this.begin = begin
        this.end = end
    }
}
