import type { HtmlTagObject } from 'html-webpack-plugin'

interface HtmlAttributes {
  [attributeName: string]: string | boolean | null | undefined
}

/**
 * 静态资源加载成功的回调函数
 * @callback resourceLoadSuccessCallback
 */

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

/**
 * @typedef {Object} RobotOptional LoadRobot类实例化的配置项
 * @property {string} [key = BIU_LIGHT_ROBOT_INSTANCE] - 挂载在window对象上的loadrobot实例的标识
 * @property {boolean} [force = false] - 环境信息根据pathname匹配；（true: 开启；false: 忽略pathname）
 */

interface Optional {
  key?: string
  force?: boolean // 开启pathname匹配
}

const defaultOptional = {
  key: 'BIU_LIGHT_ROBOT_INSTANCE',
  force: false
}

const ROBOT = Symbol.for('BIU_LIGHT_ROBOT_INSTANCE')

/** HTML静态资源环境信息管理器 */
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

  /**
   * 仅支持通过静态方法createInstance实例化LoadRobot类
   * @param {Object.<string, Object>}envMap 环境配置
   * @param {Object} optional
   * @param {string} [optional.key = "BIU_LIGHT_ROBOT_INSTANCE"] 挂载在window对象上的loadrobot实例的标识
   * @param {boolean} [optional.force = false] 环境信息根据pathname匹配；（true: 开启；false: 忽略pathname）
   * @hideconstructor
   */
  constructor (envMap: Record<string, any>, optional: Optional) {
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
    // @ts-ignore
    window[ROBOT] = key
    LoadRobot.#permit = false
    // @ts-ignore
    return window[key]
  }

  /**
   * 获取唯一的域名映射器实例
   * @returns {LoadRobot} The LoadRobot instance.
   */
  static getInstance (): LoadRobot {
    // @ts-ignore
    if (!window[ROBOT]) throw new Error('LoadRobot need initialization')
    // @ts-ignore
    return window[window[ROBOT]]
  }

  /**
   * 创建一个LoadRobot实列
   * @param {Object.<string, Object>}envMap 环境配置
   * @param {Object} optional
   * @param {string} [optional.key = "BIU_LIGHT_ROBOT_INSTANCE"] 挂载在window对象上的loadrobot实例的标识
   * @param {boolean} [optional.force = false] 环境信息根据pathname匹配；（true: 开启；false: 忽略pathname）
   */
  static createInstance (
    envMap: Record<string, any>,
    optional?: Optional
    // key = "BIU_LIGHT_ROBOT_INSTANCE"
  ) {
    const _optional = { ...defaultOptional, ...optional }
    const { key } = _optional
    // @ts-ignore
    if (window[key]) return window[key]
    this.#permit = true
    return new LoadRobot(envMap, _optional)
  }

  /**
   * 初始化LoadRobot实例
   * @param envMap
   * @param force
   * @private
   */
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
    staticDomain && this.#createBase(staticDomain)
  }

  /**
   * 获取pathname匹配的环境信息配置
   * @param envMap
   * @param hostname
   * @param pathname
   * @private
   */
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

  /**
   * 获取当前环境信息配置
   * @returns {Object.<string, string>}
   */
  public getEnvConfig () {
    return this.#envConfig
  }

  /**
   * 在html文件的head标签顶部注入base标签
   * @param {string} href base标签的href属性值
   * @param {function=} success 成功插入base标签的回调
   */
  #createBase (href: string, success?: () => void) {
    const baseEle = document.createElement('base')
    baseEle.href = href

    const header = document.getElementsByTagName('head')[0]
    // header.insertBefore(baseEle, document.currentScript!.nextElementSibling)
    header.insertBefore(baseEle, header.firstElementChild)
    // load successfully
    success && success()
  }

  /**
   * load resource by creating tag element
   * @param {string[]} list 静态资源的URL地址集合
   * @param {resourceLoadSuccessCallback=} callback 静态资源加载完成的回调函数
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
   * 在指定位置插入html资源，用于htmlWebpackPlugin自定义插件
   * @param {HtmlTagObject[]} tags html-webpack-plugin
   * @param {string} position HTML标签名，注入tags的位置
   * @ignore
   */
  static loadOrigin (tags: HtmlTagObject[], position: string) {
    const fragment = document.createDocumentFragment()
    for (const tag of tags) {
      const { tagName, attributes } = tag
      fragment.appendChild(createTag(tagName, attributes))
    }
    document.getElementsByTagName(position)[0].appendChild(fragment)
  }

  /**
   * 动态创建script标签
   * @param {string} url script标签的src属性
   * @param {boolean} [auto = true] 在head标签顶部插入此script标签，true: 插入，false: 不插入
   * @param {resourceLoadSuccessCallback=} callback 静态资源加载完成的回调函数
   * @returns {HTMLScriptElement} script标签
   */
  static createScript (url: string, auto: boolean = true, callback?: Function) {
    const script = document.createElement('script')
    const fn = callback || function () {}
    script.setAttribute('type', 'text/javascript')
    // @ts-ignore
    if (script.readyState) {
      // @ts-ignore
      script.onreadystatechange = function () {
        if (
          // @ts-ignore
          script.readyState === 'loaded' ||
          // @ts-ignore
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

  /**
   * 动态创建link标签
   * @param {string} url link标签的href属性
   * @param {boolean} [auto = true] 在head标签顶部插入此link标签，true: 插入，false: 不插入
   * @returns {HTMLLinkElement} link标签
   */
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
