import Token from './token'

export default class Identifier extends Token {
    public readonly value : string

    public constructor({ value, begin, end } : { value : string, begin : Location, end : Location }) {
        super({ begin, end })

        this.value = value
    }
}

import Location from './location'
