// HTTP 请求工具
import { ERROR_CODES } from '@/constants';

// 请求配置接口
interface RequestConfig {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  header?: Record<string, string>;
  timeout?: number;
  dataType?: string;
  responseType?: string;
  enableHttp2?: boolean;
  enableQuic?: boolean;
  enableCache?: boolean;
  enableHttpDNS?: boolean;
  httpDNSServiceId?: string;
}

// 响应接口
interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  success: boolean;
}

// 请求拦截器类型
type RequestInterceptor = (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;

// 响应拦截器类型
type ResponseInterceptor = (response: any) => any | Promise<any>;

// 错误拦截器类型
type ErrorInterceptor = (error: any) => any | Promise<any>;

class HttpClient {
  private baseURL: string;
  private timeout: number;
  private defaultHeaders: Record<string, string>;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private errorInterceptors: ErrorInterceptor[] = [];

  constructor(config: {
    baseURL?: string;
    timeout?: number;
    headers?: Record<string, string>;
  } = {}) {
    this.baseURL = config.baseURL || '';
    this.timeout = config.timeout || 10000;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...config.headers,
    };
  }

  // 添加请求拦截器
  addRequestInterceptor(interceptor: RequestInterceptor) {
    this.requestInterceptors.push(interceptor);
  }

  // 添加响应拦截器
  addResponseInterceptor(interceptor: ResponseInterceptor) {
    this.responseInterceptors.push(interceptor);
  }

  // 添加错误拦截器
  addErrorInterceptor(interceptor: ErrorInterceptor) {
    this.errorInterceptors.push(interceptor);
  }

  // 处理请求拦截器
  private async processRequestInterceptors(config: RequestConfig): Promise<RequestConfig> {
    let processedConfig = config;
    
    for (const interceptor of this.requestInterceptors) {
      processedConfig = await interceptor(processedConfig);
    }
    
    return processedConfig;
  }

  // 处理响应拦截器
  private async processResponseInterceptors(response: any): Promise<any> {
    let processedResponse = response;
    
    for (const interceptor of this.responseInterceptors) {
      processedResponse = await interceptor(processedResponse);
    }
    
    return processedResponse;
  }

  // 处理错误拦截器
  private async processErrorInterceptors(error: any): Promise<any> {
    let processedError = error;
    
    for (const interceptor of this.errorInterceptors) {
      processedError = await interceptor(processedError);
    }
    
    return processedError;
  }

  // 构建完整URL
  private buildURL(url: string): string {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `${this.baseURL}${url}`;
  }

  // 核心请求方法
  async request<T = any>(config: RequestConfig): Promise<ApiResponse<T>> {
    try {
      // 处理请求拦截器
      const processedConfig = await this.processRequestInterceptors({
        ...config,
        url: this.buildURL(config.url),
        header: {
          ...this.defaultHeaders,
          ...config.header,
        },
        timeout: config.timeout || this.timeout,
      });

      // 发送请求
      const response = await new Promise<any>((resolve, reject) => {
        uni.request({
          ...processedConfig,
          success: resolve,
          fail: reject,
        });
      });

      // 处理响应拦截器
      const processedResponse = await this.processResponseInterceptors(response);

      // 检查HTTP状态码
      if (processedResponse.statusCode >= 200 && processedResponse.statusCode < 300) {
        return processedResponse.data;
      } else {
        throw new Error(`HTTP ${processedResponse.statusCode}: ${processedResponse.data?.message || 'Request failed'}`);
      }
    } catch (error) {
      // 处理错误拦截器
      const processedError = await this.processErrorInterceptors(error);
      throw processedError;
    }
  }

  // GET 请求
  get<T = any>(url: string, params?: any, config?: Partial<RequestConfig>): Promise<ApiResponse<T>> {
    const queryString = params ? this.buildQueryString(params) : '';
    const fullUrl = queryString ? `${url}?${queryString}` : url;
    
    return this.request<T>({
      ...config,
      url: fullUrl,
      method: 'GET',
    });
  }

  // POST 请求
  post<T = any>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<ApiResponse<T>> {
    return this.request<T>({
      ...config,
      url,
      method: 'POST',
      data,
    });
  }

  // PUT 请求
  put<T = any>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<ApiResponse<T>> {
    return this.request<T>({
      ...config,
      url,
      method: 'PUT',
      data,
    });
  }

  // DELETE 请求
  delete<T = any>(url: string, config?: Partial<RequestConfig>): Promise<ApiResponse<T>> {
    return this.request<T>({
      ...config,
      url,
      method: 'DELETE',
    });
  }

  // PATCH 请求（使用PUT方法实现）
  patch<T = any>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<ApiResponse<T>> {
    return this.request<T>({
      ...config,
      url,
      method: 'PUT',
      data,
    });
  }

  // 构建查询字符串
  private buildQueryString(params: Record<string, any>): string {
    return Object.keys(params)
      .filter(key => params[key] !== undefined && params[key] !== null)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');
  }

  // 上传文件
  upload<T = any>(config: {
    url: string;
    filePath: string;
    name: string;
    formData?: Record<string, any>;
    header?: Record<string, string>;
  }): Promise<ApiResponse<T>> {
    return new Promise((resolve, reject) => {
      uni.uploadFile({
        url: this.buildURL(config.url),
        filePath: config.filePath,
        name: config.name,
        formData: config.formData,
        header: {
          ...this.defaultHeaders,
          ...config.header,
        },
        success: (response) => {
          try {
            const data = JSON.parse(response.data);
            resolve(data);
          } catch (error) {
            reject(new Error('Invalid JSON response'));
          }
        },
        fail: reject,
      });
    });
  }

  // 下载文件
  download(config: {
    url: string;
    header?: Record<string, string>;
  }): Promise<{ tempFilePath: string }> {
    return new Promise((resolve, reject) => {
      uni.downloadFile({
        url: this.buildURL(config.url),
        header: {
          ...this.defaultHeaders,
          ...config.header,
        },
        success: resolve,
        fail: reject,
      });
    });
  }
}

// 创建默认实例
const http = new HttpClient({
  baseURL: 'https://api.example.com',
  timeout: 10000,
});

// 添加默认请求拦截器（添加token）
http.addRequestInterceptor((config) => {
  const token = uni.getStorageSync('token');
  if (token) {
    config.header = {
      ...config.header,
      Authorization: `Bearer ${token}`,
    };
  }
  return config;
});

// 添加默认响应拦截器
http.addResponseInterceptor((response) => {
  // 可以在这里处理通用的响应逻辑
  return response;
});

// 添加默认错误拦截器
http.addErrorInterceptor((error) => {
  console.error('Request error:', error);
  
  // 处理网络错误
  if (!error.statusCode) {
    return {
      code: ERROR_CODES.NETWORK_ERROR,
      message: '网络连接失败，请检查网络设置',
      data: null,
      success: false,
    };
  }
  
  // 处理HTTP错误
  switch (error.statusCode) {
    case 401:
      // 未授权，清除token并跳转到登录页
      uni.removeStorageSync('token');
      uni.removeStorageSync('userInfo');
      uni.navigateTo({ url: '/pages/auth/login' });
      return {
        code: ERROR_CODES.UNAUTHORIZED,
        message: '登录已过期，请重新登录',
        data: null,
        success: false,
      };
    case 403:
      return {
        code: ERROR_CODES.FORBIDDEN,
        message: '权限不足',
        data: null,
        success: false,
      };
    case 404:
      return {
        code: ERROR_CODES.NOT_FOUND,
        message: '请求的资源不存在',
        data: null,
        success: false,
      };
    case 500:
      return {
        code: ERROR_CODES.INTERNAL_ERROR,
        message: '服务器内部错误',
        data: null,
        success: false,
      };
    default:
      return {
        code: error.statusCode,
        message: error.data?.message || '请求失败',
        data: null,
        success: false,
      };
  }
});

// 导出实例和类
export { HttpClient };
export default http;

// 导出类型
export type { RequestConfig, ApiResponse };