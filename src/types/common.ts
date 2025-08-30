// 通用类型定义

// 平台类型
export type Platform = 'H5' | 'MP-WEIXIN' | 'MP-ALIPAY' | 'MP-BAIDU' | 'MP-TOUTIAO' | 'MP-QQ' | 'APP-PLUS';

// 基础响应接口
export interface BaseResponse {
  success: boolean;
  message?: string;
  timestamp?: number;
}

// 分页参数
export interface PaginationParams {
  page: number;
  pageSize: number;
}

// 分页响应
export interface PaginationResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 选项接口
export interface Option {
  label: string;
  value: string | number;
  disabled?: boolean;
}

// 坐标接口
export interface Position {
  x: number;
  y: number;
}

// 尺寸接口
export interface Size {
  width: number;
  height: number;
}

// 矩形区域接口
export interface Rect extends Position, Size {}

// 触摸事件类型
export interface TouchEvent {
  touches: Touch[];
  changedTouches: Touch[];
  timeStamp: number;
}

// 加载状态
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// 主题类型
export type Theme = 'light' | 'dark' | 'auto';

// 语言类型
export type Language = 'zh-CN' | 'en-US';