import Parameter from './parameter'

export default class ImplicitParameter extends Parameter {
    public static from(text : string) {
        return new ImplicitParameter({ name : new Name({ text }) })
    }
}

import Name from './name'
