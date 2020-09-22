import * as l0 from "./l0";

it(`Should be an object`, () => {
    expect(typeof l0).toBe(`object`);
    expect(l0).not.toBe(null);
});

it(`Should be an object`, () => {
    expect(l0).toHaveProperty(`front`);
    expect(l0.front).not.toBe(null);
});

it(`Should be an object`, () => {
    expect(l0).toHaveProperty(`back`);
    expect(l0.back).not.toBe(null);
});

it(`Should be an object`, () => {
    expect(l0).toHaveProperty(`tokening`);
    expect(l0.tokening).not.toBe(null);
});

it(`Should be an object`, () => {
    expect(l0).toHaveProperty(`parsing`);
    expect(l0.parsing).not.toBe(null);
});
