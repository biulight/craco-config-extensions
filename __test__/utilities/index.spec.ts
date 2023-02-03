import fsPromises from "node:fs/promises"
import { resolve } from "node:path"
import { override, readAllDotenvFiles, readDotenvFiles } from "@/utilities"

describe("readDotenvFiles", () => {
  const mockFiles = async () => {
    // 源文件读取
    const path = resolve(__dirname, "__data__")
    const dir = await fsPromises.readdir(path)

    const linkFiles = new Set<string>()
    // link 文件
    for (const filename of dir) {
      const linkFile = resolve(__dirname, "../../", filename)
      linkFiles.add(linkFile)
      try {
        await fsPromises.access(linkFile)
        throw new Error(`${linkFile} is exist!`)
      } catch {}
      const file = resolve(path, filename)
      // console.log("filePath:", linkFile)
      await fsPromises.symlink(file, linkFile)
    }
    return linkFiles
  }

  const removeMockFiles = async (linkFiles: Set<string>) => {
    for (const linkFile of linkFiles) {
      const stat = await fsPromises.lstat(linkFile)
      // console.log(stat.isSymbolicLink() , '===')
      if (stat.isSymbolicLink()) await fsPromises.unlink(linkFile)
    }
  }

  it("read development", async () => {
    const linkFiles = await mockFiles()

    try {
      const dotenvData = readAllDotenvFiles(["development"])

      expect(dotenvData).toEqual({
        raw: {
          development: {
            FLY_CDN: "",
            KEY: "localhost",
            ENV: "DEV",
            DOMAIN_SERVER: "",
            BIU_CDN: "//10.154.114.165/react-template-next/",
            STATIC_DOMAIN: "//10.154.114.165/react-template-next/",
          },
        },
      })
    } catch (error) {
      throw error
    } finally {
      await removeMockFiles(linkFiles)
    }
  })
})

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
