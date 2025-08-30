// 应用常量定义

// 应用配置
export const APP_CONFIG = {
  NAME: 'P子今天买什么呢',
  VERSION: '1.0.0',
  DESCRIPTION: '购物清单应用',
} as const;

// 分页配置
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

// 缓存键名
export const CACHE_KEYS = {
  USER_INFO: 'userInfo',
  CART_DATA: 'cartData',
  SEARCH_HISTORY: 'searchHistory',
  THEME_SETTING: 'themeSetting',
  LANGUAGE_SETTING: 'languageSetting',
} as const;

// 事件名称
export const EVENTS = {
  CART_UPDATE: 'cartUpdate',
  PRODUCT_SELECT: 'productSelect',
  THEME_CHANGE: 'themeChange',
} as const;

// 路由路径
export const ROUTES = {
  HOME: '/pages/coupon/index',
  PRODUCT_DETAIL: '/pages/product/detail',
  CART: '/pages/cart/index',
  USER: '/pages/user/index',
} as const;

// API 端点
export const API_ENDPOINTS = {
  PRODUCTS: '/api/products',
  CART: '/api/cart',
  USER: '/api/user',
} as const;

// 错误码
export const ERROR_CODES = {
  SUCCESS: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
  NETWORK_ERROR: 'NETWORK_ERROR',
  PARSE_ERROR: 'PARSE_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  TIMEOUT: 'TIMEOUT',
  CANCEL: 'CANCEL',
} as const;

// 平台映射
export const PLATFORM_MAP = {
  'mp-weixin': 'MP-WEIXIN',
  'mp-alipay': 'MP-ALIPAY',
  'mp-baidu': 'MP-BAIDU',
  'mp-toutiao': 'MP-TOUTIAO',
  'mp-qq': 'MP-QQ',
  'h5': 'H5',
  'app-plus': 'APP-PLUS',
} as const;

// 主题常量
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto',
} as const;

// 语言常量
export const LANGUAGES = {
  ZH_CN: 'zh-CN',
  EN_US: 'en-US',
} as const;

// 商品排序方式
export const SORT_OPTIONS = {
  DEFAULT: 'default',
  PRICE_ASC: 'price-asc',
  PRICE_DESC: 'price-desc',
  SALES: 'sales',
  RATING: 'rating',
  NEWEST: 'newest',
} as const;

// 订单状态
export const ORDER_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
} as const;

// 支付方式
export const PAYMENT_METHODS = {
  WECHAT: 'wechat',
  ALIPAY: 'alipay',
  BALANCE: 'balance',
  CREDIT_CARD: 'credit_card',
} as const;

// 图片配置
export const IMAGE_CONFIG = {
  DEFAULT_AVATAR: '/static/images/default-avatar.png',
  DEFAULT_PRODUCT: '/static/images/default-product.png',
  PLACEHOLDER: '/static/images/placeholder.png',
  ERROR: '/static/images/error.png',
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
} as const;

// 验证规则
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 20,
  USERNAME_MIN_LENGTH: 2,
  USERNAME_MAX_LENGTH: 20,
  PHONE_PATTERN: /^1[3-9]\d{9}$/,
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  ID_CARD_PATTERN: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/,
} as const;

// 网络状态
export const NETWORK_TYPES = {
  WIFI: 'wifi',
  '2G': '2g',
  '3G': '3g',
  '4G': '4g',
  '5G': '5g',
  UNKNOWN: 'unknown',
  NONE: 'none',
} as const;

// 动画配置
export const ANIMATION_CONFIG = {
  DURATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
  },
  EASING: {
    EASE: 'ease',
    EASE_IN: 'ease-in',
    EASE_OUT: 'ease-out',
    EASE_IN_OUT: 'ease-in-out',
    LINEAR: 'linear',
  },
} as const;

// 颜色常量
export const COLORS = {
  PRIMARY: '#007AFF',
  SUCCESS: '#34C759',
  WARNING: '#FF9500',
  ERROR: '#FF3B30',
  INFO: '#5AC8FA',
  GRAY: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
} as const;