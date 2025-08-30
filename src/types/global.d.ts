// 全局类型声明文件

// 扩展 uni-app 全局对象
declare global {
  interface Uni {
    $emit: (event: string, ...args: any[]) => void;
    $on: (event: string, callback: (...args: any[]) => void) => void;
    $off: (event: string, callback?: (...args: any[]) => void) => void;
  }
}

// 扩展 Vue 组件实例类型
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $platform: string;
    $utils: typeof import('@/utils/base').default;
  }
}

// 静态资源模块声明
declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.jpeg' {
  const src: string;
  export default src;
}

declare module '*.gif' {
  const src: string;
  export default src;
}

declare module '*.svg' {
  const src: string;
  export default src;
}

declare module '*.webp' {
  const src: string;
  export default src;
}

// JSON 文件模块声明
declare module '*.json' {
  const value: any;
  export default value;
}

// CSS 模块声明
declare module '*.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.scss' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.sass' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.less' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

// uni-app 页面配置类型
interface PageConfig {
  navigationBarTitleText?: string;
  navigationBarBackgroundColor?: string;
  navigationBarTextStyle?: 'black' | 'white';
  navigationStyle?: 'default' | 'custom';
  backgroundColor?: string;
  backgroundTextStyle?: 'dark' | 'light';
  enablePullDownRefresh?: boolean;
  onReachBottomDistance?: number;
  backgroundColorTop?: string;
  backgroundColorBottom?: string;
  titleImage?: string;
  transparentTitle?: 'always' | 'auto' | 'none';
  titlePenetrate?: 'YES' | 'NO';
  app?: {
    titleNView?: {
      backgroundColor?: string;
      buttons?: Array<{
        type?: string;
        color?: string;
        background?: string;
        badgeText?: string;
        colorPressed?: string;
        float?: string;
        fontWeight?: string;
        fontSize?: string;
        fontSrc?: string;
        select?: boolean;
        text?: string;
        width?: string;
      }>;
      titleColor?: string;
      titleText?: string;
      titleSize?: string;
      type?: 'default' | 'transparent' | 'float';
    };
  };
  h5?: {
    pullToRefresh?: {
      color?: string;
    };
  };
  'mp-alipay'?: {
    allowsBounceVertical?: 'YES' | 'NO';
    titleImage?: string;
    transparentTitle?: 'always' | 'auto' | 'none';
    titlePenetrate?: 'YES' | 'NO';
    showTitleLoading?: 'YES' | 'NO';
    backgroundImageUrl?: string;
    backgroundImageColor?: string;
    gestureBack?: 'YES' | 'NO';
    enableScrollBar?: 'YES' | 'NO';
  };
  'mp-weixin'?: {
    homeButton?: boolean;
    backgroundColorTop?: string;
    backgroundColorBottom?: string;
    restartStrategy?: 'homePage' | 'homePageAndLatestPage';
    initialRenderingCache?: 'static' | 'dynamic';
    visualEffectInBackground?: 'hidden' | 'none';
    handleWebviewPreload?: 'static' | 'manual' | 'auto';
  };
}

// 环境变量类型
interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly VITE_APP_API_BASE_URL: string;
  readonly VITE_APP_ENV: 'development' | 'production' | 'test';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// 导出空对象以使此文件成为模块
export {};