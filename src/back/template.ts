export default class Template {
    public static from(...targets : number[]) {
        return new Template({ targets })
    }

    public readonly comment : string
    public readonly targets : number[]

    public constructor({ comment = ``, targets } : { comment? : string, targets : number[] }) {
        this.comment = comment
        this.targets = targets
    }
}
