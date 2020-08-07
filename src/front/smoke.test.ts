import Scope from "./scope";
import Program from "./program";

it(``, () => {
    const global = new Scope;
    const program = new Program({
        Parent : global,
    });

    // [super, program](main)
    const global_super = program.Parameters.AddDynamic(`super`);
    const global_program = program.Parameters.AddDynamic(`program`);
    const global_main = program.Parameters.AddExplicit(`main`);

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
    const x1_reference = program.Scope.GetParameter(x1);

    expect(x1_reference.Parameter).toBe(x1);
    expect(x1_reference.Name.String).toBe(`../x`);

    const x2_reference = program.Scope.GetParameter(x2);

    expect(x2_reference.Parameter).toBe(x2);
    expect(x2_reference.Name.String).toBe(`x`);
});


