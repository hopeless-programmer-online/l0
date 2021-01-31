import Parameter from './parameter'

export default class ImplicitParameter extends Parameter {
    public static From(text : string) {
        return new ImplicitParameter({ name : new Name({ text }) })
    }
}

import Name from './name'
