import { override } from "@/utilities"

describe("override", () => {
  const func1 = (val: number, extra: Record<string, number>) => {
    return val
  }
  const func2 = (val: number, extra: Record<string, number>) => {
    return val + 10 + extra?.age
  }
  const func3 = (val: number, extra: Record<string, number>) => {
    if (extra.age) extra.age += 2
    return val
  }
  const func4 = (val: number, extra: Record<string, number>) => {}
  it("combine one function", () => {
    const combineFunc = override(func1)
    expect(combineFunc(5, { age: 18 })).toBe(5)
  })

  it("combine two function", () => {
    const combineFunc = override(func1, func2)
    expect(combineFunc(5, { age: 18 })).toBe(33)
  })
  it("combine three function", () => {
    const combineFunc = override(func1, func3, func2)
    expect(combineFunc(5, { age: 18 })).toBe(35)
  })
})
