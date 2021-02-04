import Parameter from './parameter'

export default class ExplicitParameter extends Parameter {
    public static from(text : string) {
        return new ExplicitParameter({ name : new Name({ text }) })
    }
}

import Name from './name'
