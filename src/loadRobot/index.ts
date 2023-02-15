class EnvConfig {
  #envConfig: Record<string, string> = {}
  #outlet = ["load"]

  #proxyHandler = {
    get(target: EnvConfig, propKey: string) {
      if (target.#outlet.includes(propKey)) return Reflect.get(target, propKey)
      return target.#envConfig[propKey]
      // return Reflect.get(target, propKey)
    },
  }

  static #permit = false

  constructor(
    options: Record<string, any>,
    key: string = "BIU_LIGHT_ENV_CONFIG"
  ) {
    if (!EnvConfig.#permit)
      throw new Error(
        "EnvConfig only supports instantiation through the static method 'createInstance' "
      )
    // 初始化
    this.#init(options)
    // 挂载
    // @ts-ignore
    window[key] = new Proxy(this, this.#proxyHandler)
    EnvConfig.#permit = false
    // @ts-ignore
    return window[key]
  }

  /**
   * create instance
   */
  static createInstance(
    options: Record<string, any>,
    key = "PAB_BANK_ENV_CONFIG"
  ) {
    // @ts-ignore
    if (window[key]) return window[key]
    this.#permit = true
    return new EnvConfig(options, key)
  }

  #init(options: Record<string, any>) {
    const { hostname } = new URL(window.location.href)
    this.#envConfig = options[hostname] || {}
    const staticDomain = this.#envConfig["STATIC_DOMAIN"]
    this.createBase(staticDomain)
    // console.log(import.meta, "meta>>>211>>>info")
    // console.log(import.meta.url, "=====url====")
    // console.log(document.currentScript, "document.currentScript")
    // console.log("this.#envConfig", this.#envConfig)
  }
  /**
   * load baseUrl by creating base element
   *
   */
  createBase(url?: string, success?: () => void) {
    if (!url) return
    let baseEle = document.createElement("base")
    baseEle.href = url

    const header = document.getElementsByTagName("head")[0]
    // header.insertBefore(baseEle, document.currentScript!.nextElementSibling)
    header.insertBefore(baseEle, header.firstElementChild)
    // load successfully
    success && success()
  }
  /**
   * load baseUrl by creating base element
   *
   */
  load(callback: (that: EnvConfig) => string, success?: () => void) {
    const url = callback(this)
    let baseEle = document.createElement("base")
    baseEle.href = url

    const header = document.getElementsByTagName("head")[0]
    header.insertBefore(baseEle, document.currentScript!.nextElementSibling)
    // load successfully
    success && success()
  }
}

export default EnvConfig
// export default EnvConfig.createInstance({
//   ...process.env.DYNAMIC_ENV
// })
