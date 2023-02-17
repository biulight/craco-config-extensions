class LoadRobot {
  #envConfig: Record<string, string> = {}
  #outlet = ["load"]

  #proxyHandler = {
    get(target: LoadRobot, propKey: string) {
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
    if (!LoadRobot.#permit)
      throw new Error(
        "LoadRobot only supports instantiation through the static method 'createInstance' "
      )
    // 初始化
    this.#init(options)
    // 挂载
    // @ts-ignore
    window[key] = new Proxy(this, this.#proxyHandler)
    LoadRobot.#permit = false
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
    return new LoadRobot(options, key)
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
   * load resource by creating tag element
   *
   */
  static load(list: string[]) {
    for (const url of list) {
      if (url.endsWith(".js")) LoadRobot.createScript(url)
      if (url.endsWith(".css")) LoadRobot.createLink(url)
    }
  }

  static createScript(url: string, callback?: Function) {
    let script = document.createElement("script")
    let fn = callback || function () {}
    script.setAttribute("type", "text/javascript")
    // @ts-ignore
    if (script.readyState) {
      // @ts-ignore
      script.onreadystatechange = function () {
        // @ts-ignore
        if (script.readyState == "loaded" || script.readyState == "complete") {
          // @ts-ignore
          script.onreadystatechange = null
          fn()
        }
      }
    } else {
      // 其他现代浏览器
      script.onload = function () {
        fn()
      }
    }

    script.src = url
    document.getElementsByTagName("head")[0].appendChild(script)
  }

  static createLink(url: string) {
    const link = document.createElement("link")
    link.setAttribute("rel", "stylesheet")
    link.setAttribute("type", "text/css")
    link.setAttribute("href", url)
    document.getElementsByTagName("head")[0].appendChild(link)
  }
}

export default LoadRobot
// export default LoadRobot.createInstance({
//   ...process.env.DYNAMIC_ENV
// })
