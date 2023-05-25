import type { HtmlTagObject } from 'html-webpack-plugin'

interface HtmlAttributes {
  [attributeName: string]: string | boolean | null | undefined
}

function createTag (
  tagName: string,
  attributes: HtmlAttributes,
  position?: string
) {
  const tag = document.createElement(tagName)
  for (const key in attributes) {
    if (!Object.hasOwn(attributes, key)) continue
    tag.setAttribute(key, attributes[key] as string)
  }
  position && document.getElementsByTagName(position)[0].appendChild(tag)
  return tag
}

interface Optional {
  key?: string
  force?: boolean // 开启pathname匹配
}

const defaultOptional = {
  key: 'BIU_LIGHT_ROBOT_INSTANCE'
}

class LoadRobot {
  #envConfig: Record<string, string> = {}
  #outlet = ['getEnvConfig']

  #proxyHandler = {
    get (target: LoadRobot, propKey: string, receiver: LoadRobot) {
      // if (target.#outlet.includes(propKey)) return Reflect.get(target, propKey, receiver)
      if (target.#outlet.includes(propKey)) {
        return Reflect.get(target, propKey).bind(target)
      }
      return target.#envConfig[propKey]
      // return Reflect.get(target, propKey)
    }
  }

  static #permit = false

  constructor (
    envMap: Record<string, any>,
    optional: Optional
    // key: string = "BIU_LIGHT_ROBOT_INSTANCE"
  ) {
    if (!LoadRobot.#permit) {
      throw new Error(
        "LoadRobot only supports instantiation through the static method 'createInstance' "
      )
    }
    // optional ||= defaultOptional
    // 初始化
    this.#init(envMap, optional)
    // 挂载
    const { key } = optional
    // @ts-ignore
    window[key] = new Proxy(this, this.#proxyHandler)
    LoadRobot.#permit = false
    // @ts-ignore
    return window[key]
  }

  /**
   * create instance
   */
  static createInstance (
    envMap: Record<string, any>,
    optional?: Optional
    // key = "BIU_LIGHT_ROBOT_INSTANCE"
  ) {
    const { key } = (optional ||= defaultOptional)
    // @ts-ignore
    if (window[key]) return window[key]
    this.#permit = true
    return new LoadRobot(envMap, optional)
  }

  #init (envMap: Record<string, any>, { force }: Optional) {
    const { hostname, pathname } = new URL(window.location.href)
    // todo 最长子序列
    this.#envConfig = force
      ? this.#getAccordEnvConfig(envMap, { hostname, pathname })
      : envMap[hostname] || {}
    const staticDomain = this.#envConfig.STATIC_DOMAIN
    if (__DEV__ && staticDomain) {
      console.warn('已配置 STATIC_DOMAIN ，将自动创建 base 标签')
    }
    staticDomain && this.createBase(staticDomain)
  }

  #getAccordEnvConfig (
    envMap: Record<string, any>,
    { hostname, pathname }: { hostname: string; pathname: string }
  ) {
    let optimum = ''
    for (const key in envMap) {
      if (!Object.hasOwn(envMap, key)) continue
      // 自身属性
      if (!key.startsWith(hostname)) continue
      // hostname符合
      const restStr = key.slice(hostname.length)
      if (pathname.startsWith(restStr)) {
        optimum = key
        break
      }
    }
    return envMap[optimum] || {}
  }

  public getEnvConfig () {
    return this.#envConfig
  }

  /**
   * load baseUrl by creating base element
   *
   */
  createBase (url: string, success?: () => void) {
    const baseEle = document.createElement('base')
    baseEle.href = url

    const header = document.getElementsByTagName('head')[0]
    // header.insertBefore(baseEle, document.currentScript!.nextElementSibling)
    header.insertBefore(baseEle, header.firstElementChild)
    // load successfully
    success && success()
  }

  /**
   * load resource by creating tag element
   *
   */
  static load (list: string[], callback?: () => void) {
    const fragment = document.createDocumentFragment()
    let readyLoadNum = list.length
    const updateFunc = () => {
      readyLoadNum--
      if (readyLoadNum === 0 && callback) callback()
    }
    for (const url of list) {
      if (url.endsWith('.js')) {
        fragment.appendChild(LoadRobot.createScript(url, false, updateFunc))
      }
      if (url.endsWith('.css')) {
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
  static loadOrigin (tags: HtmlTagObject[], position: string) {
    const fragment = document.createDocumentFragment()
    for (const tag of tags) {
      const { tagName, attributes } = tag
      fragment.appendChild(createTag(tagName, attributes))
    }
    document.getElementsByTagName(position)[0].appendChild(fragment)
  }

  static createScript (url: string, auto: boolean = true, callback?: Function) {
    const script = document.createElement('script')
    const fn = callback || function () {}
    script.setAttribute('type', 'text/javascript')
    // @ts-ignore
    if (script.readyState) {
      // @ts-ignore
      script.onreadystatechange = function () {
        // @ts-ignore
        if (
          script.readyState === 'loaded' ||
          script.readyState === 'complete'
        ) {
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
    auto && document.getElementsByTagName('head')[0].appendChild(script)
    return script
  }

  static createLink (url: string, auto: boolean = true) {
    const link = document.createElement('link')
    link.setAttribute('rel', 'stylesheet')
    link.setAttribute('type', 'text/css')
    link.setAttribute('href', url)
    auto && document.getElementsByTagName('head')[0].appendChild(link)
    return link
  }
}

export default LoadRobot
// export default LoadRobot.createInstance({
//   ...process.env.DYNAMIC_ENV
// })
