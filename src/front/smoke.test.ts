import Scope from "./scope";
import Program from "./program";
import OutputReference from "./output-reference";

it(``, () => {
    const global = new Scope;
    const program = new Program({
        Parent : global,
    });

    // [super, program](main)
    const global_super = program.Parameters.AddDynamic(`super`);
    const global_program = program.Parameters.AddDynamic(`program`);
    const global_main = program.Parameters.AddExplicit(`main`);

    expect(`${program}`).toBe(
        `(main) {\n` +
        `}` +
    ``);

    const global_super_reference = program.Scope.GetParameter(global_super);

    expect(global_super_reference.Parameter).toBe(global_super);
    expect(global_super_reference.Name.String).toBe(`super`);

    const global_program_reference = program.Scope.GetParameter(global_program);

    expect(global_program_reference.Parameter).toBe(global_program);
    expect(global_program_reference.Name.String).toBe(`program`);

    const global_main_reference = program.Scope.GetParameter(global_main);

    expect(global_main_reference.Parameter).toBe(global_main);
    expect(global_main_reference.Name.String).toBe(`main`);
});

it(`Should overlap parameters`, () => {
    const global = new Scope;
    const program = new Program({
        Parent : global,
    });

    // [super, program](main)
    const x1 = program.Parameters.AddExplicit(`x`);
    const x2 = program.Parameters.AddExplicit(`x`);

    expect(`${program}`).toBe(
        `(x, x) {\n` +
        `}` +
    ``);

    const x1_reference = program.Scope.GetParameter(x1);

    expect(x1_reference.Parameter).toBe(x1);
    expect(x1_reference.Name.String).toBe(`../x`);

    const x2_reference = program.Scope.GetParameter(x2);

    expect(x2_reference.Parameter).toBe(x2);
    expect(x2_reference.Name.String).toBe(`x`);
});

it(``, () => {
    const global = new Scope;
    const program = new Program({
        Parent : global,
    });

    // [super]()
    const global_super = program.Parameters.AddDynamic(`super`);

    // u, v : super(super)
    const super_execution = program.Commands.AddExecution();

    super_execution.SetTarget(`super`);
    super_execution.Inputs.Add(`super`);

    const u = super_execution.Outputs.AddExplicit(`u`);
    const v = super_execution.Outputs.AddExplicit(`v`);

    const u_reference = super_execution.Scope.GetName(`u`);

    expect(u_reference).toBeInstanceOf(OutputReference);
    expect((u_reference as OutputReference).Output).toBe(u);

    // v(v)
    const v_execution = program.Commands.AddExecution();

    v_execution.SetTarget(`v`);
    v_execution.Inputs.Add(`v`);

    const v2 = v_execution.Outputs.AddExplicit(`v`);
    const v2_reference = program.Commands.Scope.GetName(`v`);

    expect(v2_reference).toBeInstanceOf(OutputReference);
    expect((v2_reference as OutputReference).Output).toBe(v2);

    const v_reference = program.Commands.Scope.GetName(`../v`);

    expect(v_reference).toBeInstanceOf(OutputReference);
    expect((v_reference as OutputReference).Output).toBe(v);

    expect(`${program}`).toBe(
        `() {\n` +
        `\tu, v : super(super)\n` +
        `\tv : v(v)\n` +
        `}` +
    ``);
});

it(``, () => {
    const global = new Scope;
    const main = new Program({
        Parent : global,
    });

    const f_declaration = main.Commands.AddDeclaration(`f`);
    const f = f_declaration.Program;

    f.Parameters.AddExplicit(`x`);
    f.Parameters.AddExplicit(`y`);
    f.Parameters.AddExplicit(`z`);

    const f_execution = main.Commands.AddExecution();

    f_execution.SetTarget(`f`);

    expect(`${main}`).toBe(
        `() {\n` +
        `\tf (x, y, z) {\n` +
        `\t}\n` +
        `\tf()\n` +
        `}` +
    ``);
});
