import Program from "../front/program";
import Tokens from "../tokening/tokens";
import Token from "../tokening/token";
import NameToken from "../tokening/name-token";
import OpeningRoundBraceToken from "../tokening/opening-round-brace-token";
import ClosingRoundBraceToken from "../tokening/closing-round-brace-token";
import OpeningFigureBraceToken from "../tokening/opening-figure-brace-token";
import ClosingFigureBraceToken from "../tokening/closing-figure-brace-token";
import CommaToken from "../tokening/comma-token";
import ColonToken from "../tokening/colon-token";

export default class Parser {
    private tokens : Array<Token> = []; // @todo?
    private position = 0;
    private level = 0;

    private get Next() { // @todo: rename?
        ++this.position;

        return this.tokens[this.position - 1];
    }

    private ParseExecution(program : Program, name : NameToken, outputs : Array<NameToken>) {
        const names : Array<NameToken> = [];

        const third = this.Next;

        if (third instanceof NameToken) {
            names.push(third);

            while (true) {
                const fourth = this.Next;

                if (fourth instanceof CommaToken) {
                    const fifth = this.Next;

                    if (!(fifth instanceof NameToken)) throw new Error; // @todo

                    names.push(fifth);
                }
                else if (fourth instanceof ClosingRoundBraceToken) break;
                else throw new Error;
            }
        }
        else if (!(third instanceof ClosingRoundBraceToken)) throw new Error; // @todo

        const execution = program.Commands.Execute(name.String);

        for (const name of names) execution.Inputs.Add(name.String);
        for (const name of outputs) execution.Outputs.Add(name.String);
    }
    private ParseFirstName(program : Program, name : NameToken) {
        const second = this.Next;

        if (second instanceof ColonToken) {
            const third = this.Next;

            if (!(third instanceof NameToken)) throw new Error; // @todo

            const fourth = this.Next;

            if (!(fourth instanceof OpeningRoundBraceToken)) throw new Error; // @todo

            this.ParseExecution(program, third, [ name ]);

            return;
        }
        else if (second instanceof CommaToken) {
            const second = this.Next;

            if (!(second instanceof NameToken)) throw new Error; // @todo

            const names = [ name, second ];

            while (true) {
                const fourth = this.Next;

                if (fourth instanceof CommaToken) {
                    const fifth = this.Next;

                    if (!(fifth instanceof NameToken)) throw new Error; // @todo

                    names.push(fifth);
                }
                else if (fourth instanceof ColonToken) break;
                else throw new Error;
            }

            const third = this.Next;

            if (!(third instanceof NameToken)) throw new Error; // @todo

            const fourth = this.Next;

            if (!(fourth instanceof OpeningRoundBraceToken)) throw new Error; // @todo

            this.ParseExecution(program, third, names);

            return;
        }
        else if (!(second instanceof OpeningRoundBraceToken)) throw new Error; // @todo

        const names : Array<NameToken> = [];

        const third = this.Next;

        if (third instanceof NameToken) {
            names.push(third);

            while (true) {
                const fourth = this.Next;

                if (fourth instanceof CommaToken) {
                    const fifth = this.Next;

                    if (!(fifth instanceof NameToken)) throw new Error; // @todo

                    names.push(fifth);
                }
                else if (fourth instanceof ClosingRoundBraceToken) break;
                else throw new Error;
            }
        }
        else if (!(third instanceof ClosingRoundBraceToken)) throw new Error; // @todo

        const fourth = this.Next;

        if (
            (fourth instanceof NameToken)
            ||
            (this.level === 0 && fourth === undefined)
            ||
            (this.level > 0 && fourth instanceof ClosingFigureBraceToken)
        ) {
            const execution = program.Commands.Execute(name.String);

            for (const name of names) execution.Inputs.Add(name.String);

            if (fourth instanceof NameToken) this.ParseFirstName(program, fourth);

            return;
        }
        else if (!(fourth instanceof OpeningFigureBraceToken)) throw new Error; // @todo

        const declaration = program.Commands.Declare(name.String);

        for (const name of names) declaration.Program.Parameters.Add(name.String);

        ++this.level;

        this.ParseCommands(declaration.Program);
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
            else if (first === undefined) return;

            if (!(first instanceof NameToken)) throw new Error; // @todo

            this.ParseFirstName(program, first);
        }
    }

    public Parse(tokens : Tokens, globals : Array<string> = []) {
        this.tokens = tokens.Array;
        this.position = 0;
        this.level = 0;

        const root = new Program;

        for (const string of globals) root.Parameters.Add(string);

        this.ParseCommands(root);

        this.tokens = [];

        return root;
    }
}
