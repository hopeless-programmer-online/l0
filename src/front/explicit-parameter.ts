import Parameter from './parameter'

export default class ExplicitParameter extends Parameter {
    public static From(text : string) {
        return new ExplicitParameter({ name : new Name({ text }) })
    }
}

import Name from './name'
