import axios, { AxiosRequestConfig, AxiosResponse, AxiosInstance, CancelTokenSource } from 'axios';

// 自定义配置选项接口
interface CustomOptions {
  retry?: number;
  retryDelay?: number;
  loadingCallback?: {
    onStart?: () => void;
    onEnd?: () => void;
  };
  cancelDuplicate?: boolean;
  cancelDuplicateDelay?: number;
}

// HttpService类
class HttpService {
  static defaultAxiosOptions: AxiosRequestConfig = {
    baseURL: '',
    timeout: 10000,
  };

  static defaultCustomOptions: CustomOptions = {
    retry: 0,
    retryDelay: 1000,
    loadingCallback: undefined,
    cancelDuplicate: false,
    cancelDuplicateDelay: 0,
  };

  private axiosOptions: AxiosRequestConfig;
  private customOptions: CustomOptions;
  private axiosInstance: AxiosInstance;
  private pendingRequests: Map<string, CancelTokenSource>;

  constructor(axiosOptions: AxiosRequestConfig = {}, customOptions: CustomOptions = {}) {
    this.axiosOptions = { ...HttpService.defaultAxiosOptions, ...axiosOptions };
    this.customOptions = { ...HttpService.defaultCustomOptions, ...customOptions };
    this.axiosInstance = axios.create(this.axiosOptions);
    this.pendingRequests = new Map();
    this._initInterceptors();
  }

  private _initInterceptors() {
    this.axiosInstance.interceptors.request.use(
      config => {
        console.log('Default request interceptor');
        return config;
      },
      error => Promise.reject(error)
    );

    this.axiosInstance.interceptors.response.use(
      response => {
        console.log('Default response interceptor');
        return response;
      },
      error => Promise.reject(error)
    );
  }

  setRequestInterceptor(onFulfilled: (value: AxiosRequestConfig) => AxiosRequestConfig | Promise<AxiosRequestConfig>, onRejected: (error: any) => any) {
    this.axiosInstance.interceptors.request.use(onFulfilled, onRejected);
  }

  setResponseInterceptor(onFulfilled: (value: AxiosResponse) => AxiosResponse | Promise<AxiosResponse>, onRejected: (error: any) => any) {
    this.axiosInstance.interceptors.response.use(onFulfilled, onRejected);
  }

  async request(config: AxiosRequestConfig, customOptions: CustomOptions = {}): Promise<AxiosResponse> {
    const finalCustomOptions = { ...this.customOptions, ...customOptions };
    const { retry, retryDelay, loadingCallback, cancelDuplicate, cancelDuplicateDelay } = finalCustomOptions;

    const requestKey = `${config.method}:${config.url}`;
    if (cancelDuplicate && this.pendingRequests.has(requestKey)) {
      const cancelTokenSource = this.pendingRequests.get(requestKey);
      cancelTokenSource?.cancel('Duplicate request canceled');
      this.pendingRequests.delete(requestKey);
      await this.delay(cancelDuplicateDelay);
    }

    const cancelTokenSource = axios.CancelToken.source();
    this.pendingRequests.set(requestKey, cancelTokenSource);

    let retries = 0;
    const executeRequest = async (): Promise<AxiosResponse> => {
      loadingCallback?.onStart?.();
      try {
        const response = await this.axiosInstance({ ...config, cancelToken: cancelTokenSource.token });
        this.pendingRequests.delete(requestKey);
        loadingCallback?.onEnd?.();
        return response;
      } catch (error) {
        if (axios.isCancel(error)) {
          throw error;
        } else if (retries < retry) {
          retries++;
          await this.delay(retryDelay);
          return executeRequest();
        } else {
          this.pendingRequests.delete(requestKey);
          loadingCallback?.onEnd?.();
          throw error;
        }
      }
    };

    return executeRequest();
  }

  delay(ms: number | undefined = 3000): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  get(url: string, config: AxiosRequestConfig = {}, customOptions: CustomOptions = {}): Promise<AxiosResponse> {
    return this.request({ url, method: 'GET', ...config }, customOptions);
  }

  post(url: string, data: any, config: AxiosRequestConfig = {}, customOptions: CustomOptions = {}): Promise<AxiosResponse> {
    return this.request({ url, method: 'POST', data, ...config }, customOptions);
  }

  put(url: string, data: any, config: AxiosRequestConfig = {}, customOptions: CustomOptions = {}): Promise<AxiosResponse> {
    return this.request({ url, method: 'PUT', data, ...config }, customOptions);
  }

  delete(url: string, config: AxiosRequestConfig = {}, customOptions: CustomOptions = {}): Promise<AxiosResponse> {
    return this.request({ url, method: 'DELETE', ...config }, customOptions);
  }

  async downloadFile(url: string, config: AxiosRequestConfig = {}, customOptions: CustomOptions = {}): Promise<void> {
    const response = await this.get(url, { responseType: 'blob', ...config }, customOptions);

    let fileName = 'downloaded_file';
    const contentDisposition = response.headers['content-disposition'];
    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/);
      if (fileNameMatch && fileNameMatch.length === 2) {
        fileName = fileNameMatch[1];
      }
    }

    const urlBlob = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = urlBlob;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  async downloadFileGet(url: string, config: AxiosRequestConfig = {}, customOptions: CustomOptions = {}): Promise<void> {
    return this.downloadFile(url, config, customOptions);
  }
}

export default HttpService;
