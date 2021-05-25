import Token from './token'

export default class Comment extends Token {
    public readonly text : string

    public constructor({ text, begin, end } : { text : string, begin : Location, end : Location }) {
        super({ begin, end })

        this.text = text
    }
}

import Location from './location'
