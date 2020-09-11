import Program from "./program";
import SuperParameter from "./super-parameter";
import ExplicitParameter from "./explicit-parameter";
import StaticParameter from "./static-parameter";
import SubOutput from "./sub-output";
import ExplicitOutput from "./explicit-output";
import Declaration from "./declaration";

/*it(``, () => {
    const program = new Program;

    const f = program.Commands.Declare(`f`);
    const x = f.Program.Parameters.Add(`x`);
    const y = f.Program.Parameters.Add(`y`);
    const z = f.Program.Parameters.Add(`z`);

    const fc = program.Commands.Execute(`f`);

    fc.Outputs.Add(`u`);
    fc.Outputs.Add(`v`);
    fc.Outputs.Add(`w`);
});*/

it(``, () => {
    // [super](x, y, z) { f(u, v, w) { i, j, k : f() } a, b, c : f() }
    const program = new Program;

    program.Parameters.Add(`x`);
    program.Parameters.Add(`y`);
    program.Parameters.Add(`z`);

    const f = program.Commands.Declare(`f`);

    f.Program.Parameters.Add(`u`);
    f.Program.Parameters.Add(`v`);
    f.Program.Parameters.Add(`w`);

    const ffc = f.Program.Commands.Execute(`f`);

    ffc.Outputs.Add(`i`);
    ffc.Outputs.Add(`j`);
    ffc.Outputs.Add(`k`);

    const fc = program.Commands.Execute(`f`);

    fc.Outputs.Add(`a`);
    fc.Outputs.Add(`b`);
    fc.Outputs.Add(`c`);

    program.Commands.Execute(`a`);

    expect(`${program}`).toBe(
        `(x, y, z) {\n` +
        `\tf (u, v, w) {\n` +
        `\t\ti, j, k : f()\n` +
        `\t}\n` +
        `\ta, b, c : f()\n` +
        `\ta()\n` +
        `}` +
    ``);

    const s = program.Parameters.Scope;

    expect(s.Get(`super`).Target).toBeInstanceOf(SuperParameter);
    expect(s.Get(`x`).Target).toBeInstanceOf(ExplicitParameter);
    expect(s.Get(`y`).Target).toBeInstanceOf(ExplicitParameter);
    expect(s.Get(`z`).Target).toBeInstanceOf(ExplicitParameter);

    const fs = f.Program.Parameters.Scope;

    expect(fs.Get(`f`).Target).toBeInstanceOf(StaticParameter);
    expect(fs.Get(`/super`).Target).toBeInstanceOf(StaticParameter);
    expect(fs.Get(`x`).Target).toBeInstanceOf(StaticParameter);
    expect(fs.Get(`y`).Target).toBeInstanceOf(StaticParameter);
    expect(fs.Get(`z`).Target).toBeInstanceOf(StaticParameter);
    expect(fs.Get(`super`).Target).toBeInstanceOf(SuperParameter);
    expect(fs.Get(`u`).Target).toBeInstanceOf(ExplicitParameter);
    expect(fs.Get(`v`).Target).toBeInstanceOf(ExplicitParameter);
    expect(fs.Get(`w`).Target).toBeInstanceOf(ExplicitParameter);

    const ffcs = ffc.Outputs.Scope;

    expect(ffcs.Get(`f`).Target).toBeInstanceOf(StaticParameter);
    expect(ffcs.Get(`/super`).Target).toBeInstanceOf(StaticParameter);
    expect(ffcs.Get(`x`).Target).toBeInstanceOf(StaticParameter);
    expect(ffcs.Get(`y`).Target).toBeInstanceOf(StaticParameter);
    expect(ffcs.Get(`z`).Target).toBeInstanceOf(StaticParameter);
    expect(ffcs.Get(`super`).Target).toBeInstanceOf(SuperParameter);
    expect(ffcs.Get(`u`).Target).toBeInstanceOf(ExplicitParameter);
    expect(ffcs.Get(`v`).Target).toBeInstanceOf(ExplicitParameter);
    expect(ffcs.Get(`w`).Target).toBeInstanceOf(ExplicitParameter);
    expect(ffcs.Get(`sub`).Target).toBeInstanceOf(SubOutput);
    expect(ffcs.Get(`i`).Target).toBeInstanceOf(ExplicitOutput);
    expect(ffcs.Get(`j`).Target).toBeInstanceOf(ExplicitOutput);
    expect(ffcs.Get(`k`).Target).toBeInstanceOf(ExplicitOutput);

    const fcs = fc.Outputs.Scope;

    expect(fcs.Get(`x`).Target).toBeInstanceOf(ExplicitParameter);
    expect(fcs.Get(`y`).Target).toBeInstanceOf(ExplicitParameter);
    expect(fcs.Get(`z`).Target).toBeInstanceOf(ExplicitParameter);
    expect(fcs.Get(`super`).Target).toBeInstanceOf(SuperParameter);
    expect(fcs.Get(`f`).Target).toBeInstanceOf(Declaration);
    expect(fcs.Get(`sub`).Target).toBeInstanceOf(SubOutput);
    expect(fcs.Get(`a`).Target).toBeInstanceOf(ExplicitOutput);
    expect(fcs.Get(`b`).Target).toBeInstanceOf(ExplicitOutput);
    expect(fcs.Get(`c`).Target).toBeInstanceOf(ExplicitOutput);
});
