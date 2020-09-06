import Program from "../front/program";
import Tokens from "../tokening/tokens";
import Token from "../tokening/token";
import NameToken from "../tokening/name-token";
import OpeningRoundBraceToken from "../tokening/opening-round-brace-token";
import ClosingRoundBraceToken from "../tokening/closing-round-brace-token";
import OpeningFigureBraceToken from "../tokening/opening-figure-brace-token";
import ClosingFigureBraceToken from "../tokening/closing-figure-brace-token";
import CommaToken from "../tokening/comma-token";

export default class Parser {
    private tokens : Array<Token> = []; // @todo?
    private position = 0;
    private level = 0;

    private get Next() { // @todo: rename?
        ++this.position;

        return this.tokens[this.position - 1];
    }

    private ParseCommands(program : Program) {
        while (true) {
            const first = this.Next;

            if (this.level > 0) {
                if (first instanceof ClosingFigureBraceToken) {
                    --this.level;

                    return;
                }
            }
            else {
                if (first === undefined) {
                    return;
                }
            }

            if (!(first instanceof NameToken)) throw new Error; // @todo

            const second = this.Next;

            if (!(second instanceof OpeningRoundBraceToken)) throw new Error; // @todo

            const names : Array<NameToken> = [];

            const third = this.Next;

            if (third instanceof NameToken) {
                names.push(third);

                while (true) {
                    const fourth = this.Next;

                    if (fourth instanceof CommaToken) {
                        const fifth = this.Next;

                        if (!(fifth instanceof NameToken)) throw new Error;

                        names.push(fifth);
                    }
                    else if (fourth instanceof ClosingRoundBraceToken) break;
                    else throw new Error;
                }
            }
            else if (!(third instanceof ClosingRoundBraceToken)) throw new Error;

            const fourth = this.Next;

            if (!(fourth instanceof OpeningFigureBraceToken)) throw new Error; // @todo

            const declaration = program.Commands.Declare(first.String);

            for (const name of names) declaration.Program.Parameters.Add(name.String);

            ++this.level;

            this.ParseCommands(declaration.Program);
        }
    }

    public Parse(tokens : Tokens) {
        this.tokens = tokens.Array;
        this.position = 0;
        this.level = 0;

        const root = new Program;

        this.ParseCommands(root);

        this.tokens = [];

        return root;
    }
}
