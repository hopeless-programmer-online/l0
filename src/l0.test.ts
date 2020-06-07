import l0 from "./l0";

it(`Should be an object`, () => {
    expect(typeof l0).toBe(`object`);
    expect(l0).not.toBe(null);
});
it(`Should export "syntax"`, () => {
    expect(l0).toHaveProperty(`syntax`);
});
