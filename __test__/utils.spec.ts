import { resolveApp, getType } from "../src/utils";
import { fileURLToPath } from "node:url";

describe("resolveApp", () => {
  it("should return the correct absolute path", () => {
    const path = resolveApp("src");
    expect(path).toBe(fileURLToPath(new URL("../src", import.meta.url)));
  });
});

describe("getType", () => {
  it("target is Promise", () => {
    expect(getType(Promise.resolve())).toBe("promise");
  });
  it("target is Array", () => {
    expect(getType([])).toBe("array");
  });
});
