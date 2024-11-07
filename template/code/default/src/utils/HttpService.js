import axios from 'axios'

/**
 * HttpService类
 * 提供基于Axios的HTTP请求服务
 */
class HttpService {
  // 默认的 Axios 配置选项
  static defaultAxiosOptions = {
    baseURL: '',
    timeout: 10000,
  };

  // 默认的自定义配置选项
  static defaultCustomOptions = {
    retry: 0,
    retryDelay: 1000,
    loadingCallback: null,
    cancelDuplicate: false,
    cancelDuplicateDelay: 0,
  };

  /**
   * 构造函数
   * @param {Object} axiosOptions - Axios 配置选项
   * @param {Object} customOptions - 自定义配置选项
   */
  constructor(axiosOptions = {}, customOptions = {}) {
    // 合并默认配置和传入的配置
    this.axiosOptions = {...HttpService.defaultAxiosOptions,...axiosOptions }
    this.customOptions = {...HttpService.defaultCustomOptions,...customOptions }
    this.axiosInstance = axios.create(this.axiosOptions)

    // 初始化拦截器
    this._initInterceptors()

    // 存储正在进行的请求
    this.pendingRequests = new Map()
  }

  // 私有方法
  _initInterceptors() {
    // 默认请求拦截器
    this.axiosInstance.interceptors.request.use(
      config => {
        console.log('Default request interceptor')
        return config
      },
      error => Promise.reject(error)
    )

    // 默认响应拦截器
    this.axiosInstance.interceptors.response.use(
      response => {
        console.log('Default response interceptor')
        return response
      },
      error => Promise.reject(error)
    )
  }

  /**
   * 设置请求拦截器
   * @param {Function} onFulfilled - 成功时的回调函数
   * @param {Function} onRejected - 失败时的回调函数
   */
  setRequestInterceptor(onFulfilled, onRejected) {
    this.axiosInstance.interceptors.request.use(onFulfilled, onRejected)
  }

  /**
   * 设置响应拦截器
   * @param {Function} onFulfilled - 成功时的回调函数
   * @param {Function} onRejected - 失败时的回调函数
   */
  setResponseInterceptor(onFulfilled, onRejected) {
    this.axiosInstance.interceptors.response.use(onFulfilled, onRejected)
  }

  /**
   * 处理请求
   * @param {Object} config - Axios 配置对象
   * @param {Object} customOptions - 自定义配置选项
   * @returns {Promise} - Axios 响应对象的 Promise
   */
  async request(config, customOptions = {}) {
    const finalCustomOptions = {...this.customOptions,...customOptions }
    const { retry, retryDelay, loadingCallback, cancelDuplicate, cancelDuplicateDelay } = finalCustomOptions

    const requestKey = `${config.method}:${config.url}`
    if (cancelDuplicate && this.pendingRequests.has(requestKey)) {
      const cancelTokenSource = this.pendingRequests.get(requestKey)
      cancelTokenSource.cancel('Duplicate request canceled')
      this.pendingRequests.delete(requestKey)

      // 等待指定的延迟时间
      await this.delay(cancelDuplicateDelay)
    }

    const cancelTokenSource = axios.CancelToken.source()
    this.pendingRequests.set(requestKey, cancelTokenSource)

    let retries = 0
    const executeRequest = async() => {
      if (loadingCallback && loadingCallback.onStart) {
        loadingCallback.onStart()
      }
      try {
        const response = await this.axiosInstance(config, { cancelToken: cancelTokenSource.token })
        cancelTokenSource.cancel() // 取消请求以释放资源
        this.pendingRequests.delete(requestKey)
        if (loadingCallback && loadingCallback.onEnd) {
          loadingCallback.onEnd()
        }
        return response
      } catch (error) {
        if (axios.isCancel(error)) {
          throw error
        } else if (retries < retry) {
          retries++
          await this.delay(retryDelay)
          return executeRequest()
        } else {
          cancelTokenSource.cancel() // 取消请求以释放资源
          this.pendingRequests.delete(requestKey)
          if (loadingCallback && loadingCallback.onEnd) {
            loadingCallback.onEnd()
          }
          throw error
        }
      }
    }

    return executeRequest()
  }

  /**
   * 延迟函数
   * @param {number} ms - 延迟的毫秒数
   * @returns {Promise} - 延迟完成的 Promise
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * GET 请求
   * @param {string} url - 请求的 URL
   * @param {Object} config - Axios 配置对象
   * @param {Object} customOptions - 自定义配置选项
   * @returns {Promise} - Axios 响应对象的 Promise
   */
  get(url, config = {}, customOptions = {}) {
    return this.request({ url, method: 'GET',...config }, customOptions)
  }

  /**
   * POST 请求
   * @param {string} url - 请求的 URL
   * @param {Object} data - 请求的数据
   * @param {Object} config - Axios 配置对象
   * @param {Object} customOptions - 自定义配置选项
   * @returns {Promise} - Axios 响应对象的 Promise
   */
  post(url, data, config = {}, customOptions = {}) {
    return this.request({ url, method: 'POST', data,...config }, customOptions)
  }

  /**
   * PUT 请求
   * @param {string} url - 请求的 URL
   * @param {Object} data - 请求的数据
   * @param {Object} config - Axios 配置对象
   * @param {Object} customOptions - 自定义配置选项
   * @returns {Promise} - Axios 响应对象的 Promise
   */
  put(url, data, config = {}, customOptions = {}) {
    return this.request({ url, method: 'PUT', data,...config }, customOptions)
  }

  /**
   * DELETE 请求
   * @param {string} url - 请求的 URL
   * @param {Object} config - Axios 配置对象
   * @param {Object} customOptions - 自定义配置选项
   * @returns {Promise} - Axios 响应对象的 Promise
   */
  delete(url, config = {}, customOptions = {}) {
    return this.request({ url, method: 'DELETE',...config }, customOptions)
  }

  /**
   * 下载文件
   * @param {string} url - 文件的 URL
   * @param {Object} config - Axios 配置对象
   * @param {Object} customOptions - 自定义配置选项
   */
  async downloadFile(url, config = {}, customOptions = {}) {
    const response = await this.get(url, { responseType: 'blob',...config }, customOptions)

    let fileName = 'downloaded_file'
    const contentDisposition = response.headers['content-disposition']
    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/)
      if (fileNameMatch && fileNameMatch.length === 2) {
        fileName = fileNameMatch[1]
      }
    }

    const urlBlob = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = urlBlob
    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  /**
   * 通过 GET 请求下载文件
   * @param {string} url - 文件的 URL
   * @param {Object} config - Axios 配置对象
   * @param {Object} customOptions - 自定义配置选项
   */
  async downloadFileGet(url, config = {}, customOptions = {}) {
    return this.downloadFile(url, config, customOptions)
  }
}

export default HttpService
