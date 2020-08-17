import Reference from "./reference";
import Name from "./name";

type References = Map<string, Reference>;

export default class Scope {
    readonly Parent : Scope | null;
    readonly Reference : Reference | null;

    public constructor({ Reference = null, Parent = null } : { Reference? : Reference | null, Parent? : Scope | null } = { Reference : null, Parent : null }) {
        this.Parent = Parent;
        this.Reference = Reference;
    }

    public get References() : References {
        // eslint-disable-next-line new-parens
        const map = new Map<string, Reference>();

        let scope : Scope | null = this;

        while (scope) {
            const reference = scope.Reference;

            if (reference) {
                let string = reference.Name.String;

                while (map.has(string)) {
                    string = `../${string}`;
                }

                map.set(string, new Reference({
                    Name   : new Name({ String : string }),
                    Target : reference.Target,
                }));
            }

            scope = scope.Parent;
        }

        return map;
    }

    public Get(string : string) : Reference {
        const references = this.References;
        const reference = references.get(string);

        if (!reference) {
            throw new Error(`Name ${JSON.stringify(string)} does not exists in ${this}`);
        }

        return reference;
    }

    public toString() : string {
        const references = this.References;

        return `[${[ ...references.keys() ].map(x => JSON.stringify(x)).join(`,`)}]`;
    }
}
