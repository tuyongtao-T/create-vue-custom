import HttpService from './HttpService'

// 正常请求
const http = new HttpService({
    baseURL: '/api',
    withCredentials: true,
    timeout: 5000,
}
)
http.setResponseInterceptor(
    response => {
      console.log('Custom response interceptor');
      // 可以在这里处理响应数据
      return response;
    },
    error => {
      console.error('Response interceptor error:', error);
      return Promise.reject(error);
    }
  );

  http.setResponseInterceptor(
    response => {
      console.log('Custom response interceptor');
      // 可以在这里处理响应数据
      return response;
    },
    error => {
      console.error('Response interceptor error:', error);
      return Promise.reject(error);
    }
  );

  export default http
  
  