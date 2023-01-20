import { resolveApp, getType } from '../src/utils'
import { fileURLToPath } from 'node:url'

describe('resolveApp', () => {
  it('should return the correct absolute path', () => {
    const path = resolveApp('src')
    expect(path).toBe(fileURLToPath(new URL('../src', import.meta.url)))
  })
})


describe('getType', () => {
  it('target is promise', () => {
    expect(getType(Promise.resolve())).toBe('promise')
  })
})
