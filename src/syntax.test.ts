import syntax from "./syntax";

it(`Should be an object`, () => {
    expect(typeof syntax).toBe(`object`);
    expect(syntax).not.toBe(null);
});
