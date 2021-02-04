export default class Template {
    public static from(...targets : number[]) {
        return new Template({ targets })
    }

    public readonly targets : number[]

    public constructor({ targets } : { targets : number[] }) {
        this.targets = targets
    }
}
