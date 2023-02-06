import { Analyzer as LexisAnalyzer } from './lexis'
import { Analyzer as SyntaxAnalyzer } from './syntax'
import { Analyzer as SemanticsAnalyzer } from './semantics'

function parse(text : string) {
    const lexisAnalyzer = new LexisAnalyzer
    const lexemes = lexisAnalyzer.analyze(text)
    const syntaxAnalyzer = new SyntaxAnalyzer
    const main = syntaxAnalyzer.analyze(lexemes)
    const semanticsAnalyzer = new SemanticsAnalyzer

    semanticsAnalyzer.analyze(main)
}

test(`Smoke test`, () => {
    expect(() => parse(``)).not.toThrow()
    expect(() => parse(`f(){}`)).not.toThrow()
    expect(() => parse(`f()`)).not.toThrow()
    expect(() => parse(`f(){}f()`)).not.toThrow()
})
