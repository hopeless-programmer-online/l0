import Word from './word'

export default class QuotedWord extends Word {
    public readonly text : string
    public readonly begin : Location
    public readonly end : Location

    public constructor({ text, begin, end } : { text : string, begin : Location, end : Location }) {
        super()

        this.text = text
        this.begin = begin
        this.end = end
    }
}

import Location from './location'
