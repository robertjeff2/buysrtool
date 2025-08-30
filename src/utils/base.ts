// src/utils/base.ts
import type { Platform } from '@/types/common';

// 平台检测工具函数
export const getPlatform = (): Platform => {
  // #ifdef H5
  return 'H5';
  // #endif
  
  // #ifdef MP-WEIXIN
  return 'MP-WEIXIN';
  // #endif
  
  // #ifdef MP-ALIPAY
  return 'MP-ALIPAY';
  // #endif
  
  // #ifdef MP-BAIDU
  return 'MP-BAIDU';
  // #endif
  
  // #ifdef MP-TOUTIAO
  return 'MP-TOUTIAO';
  // #endif
  
  // #ifdef MP-QQ
  return 'MP-QQ';
  // #endif
  
  // #ifdef APP-PLUS
  return 'APP-PLUS';
  // #endif
  
  return 'H5';
};

// 格式化价格
export const formatPrice = (price: number): string => {
  // 如果是整数，不显示小数点
  if (price % 1 === 0) {
    return `¥${price}`;
  }
  return `¥${price.toFixed(2)}`;
};

// 格式化数字
export const formatNumber = (num: number): string => {
  if (num >= 10000) {
    return `${(num / 10000).toFixed(1)}万`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toString();
};

// 防抖函数
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: number | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), wait);
  };
};

// 节流函数
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let lastTime = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastTime >= wait) {
      lastTime = now;
      func(...args);
    }
  };
};

// 深拷贝
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T;
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as T;
  }
  
  if (typeof obj === 'object') {
    const cloned = {} as T;
    Object.keys(obj).forEach(key => {
      (cloned as any)[key] = deepClone((obj as any)[key]);
    });
    return cloned;
  }
  
  return obj;
};

// 生成唯一ID
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// 存储工具
export const storage = {
  set(key: string, value: any): void {
    try {
      uni.setStorageSync(key, JSON.stringify(value));
    } catch (error) {
      console.error('存储数据失败:', error);
    }
  },
  
  get<T>(key: string, defaultValue?: T): T | null {
    try {
      const value = uni.getStorageSync(key);
      return value ? JSON.parse(value) : defaultValue || null;
    } catch (error) {
      console.error('读取数据失败:', error);
      return defaultValue || null;
    }
  },
  
  remove(key: string): void {
    try {
      uni.removeStorageSync(key);
    } catch (error) {
      console.error('删除数据失败:', error);
    }
  },
  
  clear(): void {
    try {
      uni.clearStorageSync();
    } catch (error) {
      console.error('清空存储失败:', error);
    }
  },
};

// 兼容旧版本的导出
export default {
  getPlat: getPlatform,
  formatPrice,
  formatNumber,
  debounce,
  throttle,
  deepClone,
  generateId,
  storage,
};