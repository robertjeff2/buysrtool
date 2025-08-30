// uni-app 相关类型定义

// uni-app API 响应类型
export interface UniResponse<T = any> {
  data: T;
  statusCode: number;
  header: Record<string, string>;
  cookies?: string[];
}

// uni.request 参数类型
export interface UniRequestOptions {
  url: string;
  data?: any;
  header?: Record<string, string>;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'CONNECT' | 'HEAD' | 'OPTIONS' | 'TRACE';
  timeout?: number;
  dataType?: 'json' | 'text' | 'base64';
  responseType?: 'text' | 'arraybuffer';
  sslVerify?: boolean;
  withCredentials?: boolean;
  firstIpv4?: boolean;
  success?: (result: UniResponse) => void;
  fail?: (error: any) => void;
  complete?: (result: any) => void;
}

// uni.showToast 参数类型
export interface UniShowToastOptions {
  title: string;
  icon?: 'success' | 'loading' | 'error' | 'none';
  image?: string;
  duration?: number;
  mask?: boolean;
  position?: 'top' | 'center' | 'bottom';
  success?: () => void;
  fail?: (error: any) => void;
  complete?: () => void;
}

// uni.showModal 参数类型
export interface UniShowModalOptions {
  title?: string;
  content?: string;
  showCancel?: boolean;
  cancelText?: string;
  cancelColor?: string;
  confirmText?: string;
  confirmColor?: string;
  editable?: boolean;
  placeholderText?: string;
  success?: (result: { confirm: boolean; cancel: boolean; content?: string }) => void;
  fail?: (error: any) => void;
  complete?: () => void;
}

// uni.showActionSheet 参数类型
export interface UniShowActionSheetOptions {
  itemList: string[];
  itemColor?: string;
  popover?: {
    top?: number;
    left?: number;
    width?: number;
    height?: number;
  };
  success?: (result: { tapIndex: number }) => void;
  fail?: (error: any) => void;
  complete?: () => void;
}

// uni.showLoading 参数类型
export interface UniShowLoadingOptions {
  title: string;
  mask?: boolean;
  success?: () => void;
  fail?: (error: any) => void;
  complete?: () => void;
}

// uni.navigateTo 参数类型
export interface UniNavigateToOptions {
  url: string;
  animationType?: 'slide-in-right' | 'slide-in-left' | 'slide-in-top' | 'slide-in-bottom' | 'fade-in' | 'zoom-out' | 'zoom-fade-out' | 'pop-in' | 'none';
  animationDuration?: number;
  events?: Record<string, (...args: any[]) => void>;
  success?: (result: any) => void;
  fail?: (error: any) => void;
  complete?: () => void;
}

// uni.redirectTo 参数类型
export interface UniRedirectToOptions {
  url: string;
  success?: (result: any) => void;
  fail?: (error: any) => void;
  complete?: () => void;
}

// uni.reLaunch 参数类型
export interface UniReLaunchOptions {
  url: string;
  success?: (result: any) => void;
  fail?: (error: any) => void;
  complete?: () => void;
}

// uni.switchTab 参数类型
export interface UniSwitchTabOptions {
  url: string;
  success?: (result: any) => void;
  fail?: (error: any) => void;
  complete?: () => void;
}

// uni.navigateBack 参数类型
export interface UniNavigateBackOptions {
  delta?: number;
  animationType?: 'slide-out-right' | 'slide-out-left' | 'slide-out-top' | 'slide-out-bottom' | 'fade-out' | 'zoom-in' | 'zoom-fade-in' | 'pop-out' | 'none';
  animationDuration?: number;
  success?: (result: any) => void;
  fail?: (error: any) => void;
  complete?: () => void;
}

// uni.setStorage 参数类型
export interface UniSetStorageOptions {
  key: string;
  data: any;
  success?: () => void;
  fail?: (error: any) => void;
  complete?: () => void;
}

// uni.getStorage 参数类型
export interface UniGetStorageOptions {
  key: string;
  success?: (result: { data: any }) => void;
  fail?: (error: any) => void;
  complete?: () => void;
}

// uni.removeStorage 参数类型
export interface UniRemoveStorageOptions {
  key: string;
  success?: () => void;
  fail?: (error: any) => void;
  complete?: () => void;
}

// uni.getSystemInfo 返回类型
export interface UniSystemInfo {
  brand: string;
  model: string;
  pixelRatio: number;
  screenWidth: number;
  screenHeight: number;
  windowWidth: number;
  windowHeight: number;
  statusBarHeight: number;
  language: string;
  version: string;
  system: string;
  platform: string;
  fontSizeSetting: number;
  SDKVersion: string;
  benchmarkLevel: number;
  albumAuthorized: boolean;
  cameraAuthorized: boolean;
  locationAuthorized: boolean;
  microphoneAuthorized: boolean;
  notificationAuthorized: boolean;
  notificationAlertAuthorized: boolean;
  notificationBadgeAuthorized: boolean;
  notificationSoundAuthorized: boolean;
  bluetoothEnabled: boolean;
  locationEnabled: boolean;
  wifiEnabled: boolean;
  safeArea: {
    left: number;
    right: number;
    top: number;
    bottom: number;
    width: number;
    height: number;
  };
  safeAreaInsets: {
    top: number;
    left: number;
    right: number;
    bottom: number;
  };
}

// 触摸事件类型
export interface UniTouchEvent {
  type: string;
  timeStamp: number;
  target: {
    id: string;
    tagName: string;
    dataset: Record<string, any>;
  };
  currentTarget: {
    id: string;
    tagName: string;
    dataset: Record<string, any>;
  };
  touches: Array<{
    identifier: number;
    pageX: number;
    pageY: number;
    clientX: number;
    clientY: number;
  }>;
  changedTouches: Array<{
    identifier: number;
    pageX: number;
    pageY: number;
    clientX: number;
    clientY: number;
  }>;
}

// 页面生命周期类型
export interface PageLifecycle {
  onLoad?: (options: Record<string, string | undefined>) => void;
  onShow?: () => void;
  onReady?: () => void;
  onHide?: () => void;
  onUnload?: () => void;
  onPullDownRefresh?: () => void;
  onReachBottom?: () => void;
  onShareAppMessage?: (options: { from: string; target?: any; webViewUrl?: string }) => {
    title?: string;
    path?: string;
    imageUrl?: string;
  };
  onShareTimeline?: () => {
    title?: string;
    query?: string;
    imageUrl?: string;
  };
  onAddToFavorites?: (options: { webViewUrl?: string }) => {
    title?: string;
    imageUrl?: string;
    query?: string;
  };
  onPageScroll?: (options: { scrollTop: number }) => void;
  onResize?: (options: { size: { windowWidth: number; windowHeight: number } }) => void;
  onTabItemTap?: (options: { index: string; pagePath: string; text: string }) => void;
}