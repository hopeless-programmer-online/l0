import Name from "./name";
import Parameter from "./parameter";
import Reference from "./reference";
import ParameterReference from "./parameter-reference";

type References = Map<string, Reference>;

export default class Scope {
    readonly Parent : Scope | null;
    readonly Reference : Reference | null;

    public constructor({ Reference = null, Parent = null } : { Reference? : Reference | null, Parent? : Scope | null } = { Reference : null, Parent : null }) {
        this.Parent = Parent;
        this.Reference = Reference;
    }

    public get References() : References {
        const references : References = new Map;

        let scope : Scope | null = this;

        while (scope) {
            const reference = scope.Reference;

            if (reference) {
                let string = reference.Name.String;

                while (references.has(string)) {
                    string = `../${string}`;
                }

                references.set(string, reference.Copy(new Name({
                    String : string,
                })));
            }

            scope = scope.Parent;
        }

        return references;
    }

    public GetName(string : string) : Reference {
        const reference = this.References.get(string);

        if (!reference) {
            throw new Error(`Reference with name ${JSON.stringify(string)} does not exists in ${this}.`);
        }

        return reference;
    }
    public GetParameter(parameter : Parameter) : ParameterReference {
        for (const reference of this.References.values()) {
            if (reference instanceof ParameterReference && reference.Parameter === parameter) {
                return reference;
            }
        }

        throw new Error; // @todo
    }

    public toString() : string {
        const references = this.References;

        if (references.size === 0) {
            return `{}`;
        }

        const keys = Array.from(references.keys());

        return `{ ${keys.join(`, `)} }`;
    }
}
