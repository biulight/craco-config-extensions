import type { HtmlTagObject } from "html-webpack-plugin"

interface HtmlAttributes {
  [attributeName: string]: string | boolean | null | undefined
}

function createTag(
  tagName: string,
  attributes: HtmlAttributes,
  position?: string
) {
  const tag = document.createElement(tagName)
  for (const key in attributes) {
    if (!attributes.hasOwnProperty(key)) continue
    tag.setAttribute(key, attributes[key] as string)
  }
  position && document.getElementsByTagName(position)[0].appendChild(tag)
  return tag
}

class LoadRobot {
  #envConfig: Record<string, string> = {}
  #outlet = ["getEnvConfig"]

  #proxyHandler = {
    get(target: LoadRobot, propKey: string, receiver: LoadRobot) {
      // if (target.#outlet.includes(propKey)) return Reflect.get(target, propKey, receiver)
      if (target.#outlet.includes(propKey))
        return Reflect.get(target, propKey).bind(target)
      return target.#envConfig[propKey]
      // return Reflect.get(target, propKey)
    },
  }

  static #permit = false

  constructor(
    options: Record<string, any>,
    key: string = "BIU_LIGHT_ROBOT_INSTANCE"
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
    key = "BIU_LIGHT_ROBOT_INSTANCE"
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
    if (__DEV__ && staticDomain) {
      console.warn("已配置 STATIC_DOMAIN ，将自动创建 base 标签")
    }
    this.createBase(staticDomain)
  }

  public getEnvConfig() {
    return this.#envConfig
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
  static load(list: string[], callback?: () => void) {
    const fragment = document.createDocumentFragment()
    let readyLoadNum = list.length
    const updateFunc = () => {
      readyLoadNum--
      if (readyLoadNum === 0 && callback) callback()
    }
    for (const url of list) {
      if (url.endsWith(".js")) {
        fragment.appendChild(LoadRobot.createScript(url, false, updateFunc))
      }
      if (url.endsWith(".css")) {
        readyLoadNum--
        fragment.appendChild(LoadRobot.createLink(url, false))
      }
    }

    const currentScript = document.currentScript
    currentScript?.parentElement?.insertBefore(
      fragment,
      currentScript.nextElementSibling
    )
  }

  /**
   * load Webpack Resource
   */
  static loadOrigin(tags: HtmlTagObject[], position: string) {
    const fragment = document.createDocumentFragment()
    for (const tag of tags) {
      const { tagName, attributes } = tag
      fragment.appendChild(createTag(tagName, attributes))
    }
    document.getElementsByTagName(position)[0].appendChild(fragment)
  }

  static createScript(url: string, auto: boolean = true, callback?: Function) {
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
    auto && document.getElementsByTagName("head")[0].appendChild(script)
    return script
  }

  static createLink(url: string, auto: boolean = true) {
    const link = document.createElement("link")
    link.setAttribute("rel", "stylesheet")
    link.setAttribute("type", "text/css")
    link.setAttribute("href", url)
    auto && document.getElementsByTagName("head")[0].appendChild(link)
    return link
  }
}

export default LoadRobot
// export default LoadRobot.createInstance({
//   ...process.env.DYNAMIC_ENV
// })
