import Reference from "./reference";
import Name from "../tokening/name";
import NameToken from "../tokening/name-token";
import References from "./references";
import PlainWord from "../tokening/plain-word";
import Position from "../tokening/position";

export default class Scope {
    public Parent : Scope | null;
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

                while (true) {
                    if (!references.Has(name)) break;

                    // console.log(`overlapping ${name} : `, references.Get(name).Target, ` with `, reference.Target);

                    name = prefix(name);
                }

                // console.log(`${name} : `, reference.Target);

                references.Add(name, new Reference({
                    Name   : name,
                    Target : reference.Target,
                }));
            }

            scope = scope.Parent;
        } while (scope);

        return references;
    }

    public Get(name : NameToken | Name | string) : Reference {
        if (name instanceof NameToken) name = name.Name;
        if (typeof name === `string`) name = Name.Plain(name);

        return this.References.Get(name);
    }
    public TryGet(name : NameToken | Name | string) {
        if (name instanceof NameToken) name = name.Name;
        if (typeof name === `string`) name = Name.Plain(name);

        return this.References.TryGet(name);
    }

    public toString() : string {
        return this.References.toString();
    }
}

function prefix(name : Name) : Name {
    const words = name.Words;

    if (words.length <= 0) throw new Error; // @todo

    const first = words[0];

    if (first instanceof PlainWord) {
        const position = new Position({
            Offset : 0,
            Line   : 0,
            Column : 0,
        });

        return new Name({
            Words : [
                new PlainWord({
                    Text  : `/${first.Text}`,
                    Begin : position,
                    End   : position,
                }),
                ...words.slice(1),
            ],
        });
    }
    // @todo: Quoted Word
    else throw new Error; // @todo
}
