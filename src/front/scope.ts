import Reference from "./reference";
import Name from "../tokening/name";
import NameToken from "../tokening/name-token";
import References from "./references";
import PlainWord from "../tokening/plain-word";

export default class Scope {
    readonly Parent : Scope | null;
    readonly Reference : Reference | null;

    public constructor({ Reference = null, Parent = null } : { Reference? : Reference | null, Parent? : Scope | null } = { Reference : null, Parent : null }) {
        this.Parent = Parent;
        this.Reference = Reference;
    }

    public get References() : References {
        // eslint-disable-next-line new-parens
        const references = new References;

        let scope : Scope | null = this;

        do {
            const reference = scope.Reference;

            if (reference) {
                let name = reference.Name;

                while (references.Has(name)) {
                    const words = name.Words;

                    if (words.length <= 0) throw new Error; // @todo

                    const first = words[0];

                    if (first instanceof PlainWord) {
                        name = new Name({
                            Words : [
                                new PlainWord({ Text : `/${first.Text}` }),
                                ...words.slice(1),
                            ],
                        });
                    }
                    else throw new Error; // @todo
                }

                references.Add(name, new Reference({
                    Name   : name,
                    Target : reference.Target,
                }));
            }
            // const reference = scope.Reference;

            // if (reference) {
            //     let string = reference.Name.String;

            //     while (map.has(string)) {
            //         string = `/${string}`;
            //     }

            //     map.set(string, new Reference({
            //         Name   : new Name({ String : string }),
            //         Target : reference.Target,
            //     }));
            // }

            scope = scope.Parent;
        } while (scope);

        return references;
    }

    public Get(name : NameToken | Name | string) : Reference {
        if (name instanceof NameToken) name = name.Name;
        if (typeof name === `string`) name = Name.Plain(name);

        return this.References.Get(name);
    }

    public toString() : string {
        const references = this.References;

        return `[${[ ...references.Keys ].map(x => JSON.stringify(x)).join(`,`)}]`;
    }
}
