import Reference from "./reference"

export type Parent = Scope | null

export default class Scope {
    public reference : Reference | null
    public parent : Parent

    public constructor({ reference = null, parent = null } : { reference? : Reference | null, parent? : Parent } = {}) {
        this.reference = reference
        this.parent = parent
    }
}
