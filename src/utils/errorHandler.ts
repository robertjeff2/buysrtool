// 全局错误处理机制
import { ERROR_CODES } from '@/constants';

// 错误类型定义
export interface AppError {
  code: string | number;
  message: string;
  stack?: string;
  timestamp: number;
  url?: string;
  userAgent?: string;
  userId?: string;
}

// 错误级别
export enum ErrorLevel {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

// 错误处理器接口
export interface ErrorHandler {
  handle(error: AppError, level: ErrorLevel): void;
}

// 控制台错误处理器
class ConsoleErrorHandler implements ErrorHandler {
  handle(error: AppError, level: ErrorLevel): void {
    const logMethod = level === ErrorLevel.ERROR || level === ErrorLevel.CRITICAL ? 'error' : 'warn';
    console[logMethod](`[${level.toUpperCase()}] ${error.message}`, error);
  }
}

// 存储错误处理器
class StorageErrorHandler implements ErrorHandler {
  private readonly maxErrors = 50;
  private readonly storageKey = 'app_errors';

  handle(error: AppError, level: ErrorLevel): void {
    try {
      const errors = this.getStoredErrors();
      errors.unshift({ ...error, level });
      
      // 保持错误数量在限制内
      if (errors.length > this.maxErrors) {
        errors.splice(this.maxErrors);
      }
      
      uni.setStorageSync(this.storageKey, JSON.stringify(errors));
    } catch (e) {
      console.error('Failed to store error:', e);
    }
  }

  private getStoredErrors(): Array<AppError & { level: ErrorLevel }> {
    try {
      const stored = uni.getStorageSync(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }

  // 获取存储的错误
  getErrors(): Array<AppError & { level: ErrorLevel }> {
    return this.getStoredErrors();
  }

  // 清除存储的错误
  clearErrors(): void {
    try {
      uni.removeStorageSync(this.storageKey);
    } catch (e) {
      console.error('Failed to clear errors:', e);
    }
  }
}

// 用户提示错误处理器
class ToastErrorHandler implements ErrorHandler {
  private readonly showDuration = 2000;
  private lastToastTime = 0;
  private readonly throttleTime = 1000; // 1秒内只显示一次

  handle(error: AppError, level: ErrorLevel): void {
    const now = Date.now();
    
    // 节流处理，避免频繁弹出提示
    if (now - this.lastToastTime < this.throttleTime) {
      return;
    }
    
    this.lastToastTime = now;
    
    // 只对用户友好的错误显示提示
    if (this.shouldShowToUser(error, level)) {
      uni.showToast({
        title: this.formatErrorMessage(error.message),
        icon: 'none',
        duration: this.showDuration,
      });
    }
  }

  private shouldShowToUser(error: AppError, level: ErrorLevel): boolean {
    // 网络错误、权限错误等需要用户知道的错误
    const userFacingCodes = [
      ERROR_CODES.NETWORK_ERROR,
      ERROR_CODES.UNAUTHORIZED,
      ERROR_CODES.FORBIDDEN,
      ERROR_CODES.NOT_FOUND,
      ERROR_CODES.TIMEOUT,
    ];
    
    return userFacingCodes.includes(error.code as any) || level === ErrorLevel.CRITICAL;
  }

  private formatErrorMessage(message: string): string {
    // 限制消息长度
    const maxLength = 30;
    return message.length > maxLength ? `${message.substring(0, maxLength)}...` : message;
  }
}

// 远程错误处理器（上报错误到服务器）
class RemoteErrorHandler implements ErrorHandler {
  private readonly reportUrl = '/api/errors';
  private readonly batchSize = 10;
  private readonly flushInterval = 30000; // 30秒
  private errorQueue: Array<AppError & { level: ErrorLevel }> = [];
  private flushTimer: number | null = null;

  constructor() {
    this.startFlushTimer();
  }

  handle(error: AppError, level: ErrorLevel): void {
    // 只上报严重错误
    if (level === ErrorLevel.ERROR || level === ErrorLevel.CRITICAL) {
      this.errorQueue.push({ ...error, level });
      
      // 如果队列满了，立即上报
      if (this.errorQueue.length >= this.batchSize) {
        this.flush();
      }
    }
  }

  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      if (this.errorQueue.length > 0) {
        this.flush();
      }
    }, this.flushInterval) as any;
  }

  private async flush(): Promise<void> {
    if (this.errorQueue.length === 0) return;
    
    const errors = [...this.errorQueue];
    this.errorQueue = [];
    
    try {
      await uni.request({
        url: this.reportUrl,
        method: 'POST',
        data: { errors },
        header: {
          'Content-Type': 'application/json',
        },
      });
    } catch (e) {
      // 上报失败，重新加入队列
      this.errorQueue.unshift(...errors);
      console.error('Failed to report errors:', e);
    }
  }

  // 销毁时清理定时器
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    
    // 最后一次上报
    if (this.errorQueue.length > 0) {
      this.flush();
    }
  }
}

// 全局错误管理器
class GlobalErrorManager {
  private handlers: ErrorHandler[] = [];
  private isInitialized = false;

  constructor() {
    this.init();
  }

  private init(): void {
    if (this.isInitialized) return;
    
    // 添加默认错误处理器
    this.addHandler(new ConsoleErrorHandler());
    this.addHandler(new StorageErrorHandler());
    this.addHandler(new ToastErrorHandler());
    this.addHandler(new RemoteErrorHandler());
    
    // 监听全局错误
    this.setupGlobalErrorHandling();
    
    this.isInitialized = true;
  }

  private setupGlobalErrorHandling(): void {
    // 监听 Vue 错误
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        this.handleError({
          code: ERROR_CODES.INTERNAL_ERROR,
          message: event.message || 'Unknown error',
          stack: event.error?.stack,
          timestamp: Date.now(),
          url: event.filename,
        }, ErrorLevel.ERROR);
      });

      window.addEventListener('unhandledrejection', (event) => {
        this.handleError({
          code: ERROR_CODES.INTERNAL_ERROR,
          message: event.reason?.message || 'Unhandled promise rejection',
          stack: event.reason?.stack,
          timestamp: Date.now(),
        }, ErrorLevel.ERROR);
      });
    }
  }

  // 添加错误处理器
  addHandler(handler: ErrorHandler): void {
    this.handlers.push(handler);
  }

  // 移除错误处理器
  removeHandler(handler: ErrorHandler): void {
    const index = this.handlers.indexOf(handler);
    if (index > -1) {
      this.handlers.splice(index, 1);
    }
  }

  // 处理错误
  handleError(error: Partial<AppError>, level: ErrorLevel = ErrorLevel.ERROR): void {
    const fullError: AppError = {
      code: error.code || ERROR_CODES.INTERNAL_ERROR,
      message: error.message || 'Unknown error',
      stack: error.stack,
      timestamp: error.timestamp || Date.now(),
      url: error.url,
      userAgent: error.userAgent,
      userId: error.userId,
    };

    // 调用所有错误处理器
    this.handlers.forEach(handler => {
      try {
        handler.handle(fullError, level);
      } catch (e) {
        console.error('Error handler failed:', e);
      }
    });
  }

  // 处理网络错误
  handleNetworkError(error: any): void {
    this.handleError({
      code: ERROR_CODES.NETWORK_ERROR,
      message: '网络连接失败，请检查网络设置',
      stack: error?.stack,
    }, ErrorLevel.WARNING);
  }

  // 处理业务错误
  handleBusinessError(code: string | number, message: string): void {
    this.handleError({
      code,
      message,
    }, ErrorLevel.INFO);
  }

  // 处理权限错误
  handlePermissionError(message: string = '权限不足'): void {
    this.handleError({
      code: ERROR_CODES.FORBIDDEN,
      message,
    }, ErrorLevel.WARNING);
  }

  // 处理验证错误
  handleValidationError(message: string): void {
    this.handleError({
      code: ERROR_CODES.VALIDATION_ERROR,
      message,
    }, ErrorLevel.INFO);
  }

  // 获取存储的错误（用于调试）
  getStoredErrors(): Array<AppError & { level: ErrorLevel }> {
    const storageHandler = this.handlers.find(h => h instanceof StorageErrorHandler) as StorageErrorHandler;
    return storageHandler ? storageHandler.getErrors() : [];
  }

  // 清除存储的错误
  clearStoredErrors(): void {
    const storageHandler = this.handlers.find(h => h instanceof StorageErrorHandler) as StorageErrorHandler;
    if (storageHandler) {
      storageHandler.clearErrors();
    }
  }
}

// 创建全局实例
const errorManager = new GlobalErrorManager();

// 导出便捷方法
export const handleError = (error: Partial<AppError>, level?: ErrorLevel) => {
  errorManager.handleError(error, level);
};

export const handleNetworkError = (error: any) => {
  errorManager.handleNetworkError(error);
};

export const handleBusinessError = (code: string | number, message: string) => {
  errorManager.handleBusinessError(code, message);
};

export const handlePermissionError = (message?: string) => {
  errorManager.handlePermissionError(message);
};

export const handleValidationError = (message: string) => {
  errorManager.handleValidationError(message);
};

export const getStoredErrors = () => {
  return errorManager.getStoredErrors();
};

export const clearStoredErrors = () => {
  errorManager.clearStoredErrors();
};

// 导出类和实例
export {
  GlobalErrorManager,
  ConsoleErrorHandler,
  StorageErrorHandler,
  ToastErrorHandler,
  RemoteErrorHandler,
  errorManager,
};

export default errorManager;