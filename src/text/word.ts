export default abstract class Word {
    public readonly abstract text : string
    public readonly abstract begin : Location
    public readonly abstract end : Location
}

import Location from './location'
