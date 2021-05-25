import Token from './token'

export type Words = Word[]

export default class Identifier extends Token {
    public words : Words

    public constructor({ words } : { words : Words }) {
        super({
            begin : words[0].begin,
            end   : words[words.length - 1].end,
        })

        this.words = words
    }

    public get string() : string {
        return this.words.map(({ text }) => text).join(' ')
    }
}

import Location from './location'
import Word from './word'
