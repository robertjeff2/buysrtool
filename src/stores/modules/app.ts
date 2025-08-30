// 应用状态管理
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Theme, Language } from '@/types/common';

interface AppState {
  theme: Theme;
  language: Language;
  isLoading: boolean;
  systemInfo: UniApp.GetSystemInfoResult | null;
  networkType: string;
  isOnline: boolean;
}

export const useAppStore = defineStore(
  'app',
  () => {
    // 状态
    const theme = ref<Theme>('light');
    const language = ref<Language>('zh-CN');
    const isLoading = ref(false);
    const systemInfo = ref<UniApp.GetSystemInfoResult | null>(null);
    const networkType = ref('unknown');
    const isOnline = ref(true);

    // 计算属性
    const isDarkMode = computed(() => theme.value === 'dark');
    const isIOS = computed(() => systemInfo.value?.platform === 'ios');
    const isAndroid = computed(() => systemInfo.value?.platform === 'android');
    const statusBarHeight = computed(() => systemInfo.value?.statusBarHeight || 0);
    const safeAreaInsets = computed(() => systemInfo.value?.safeAreaInsets || { top: 0, bottom: 0, left: 0, right: 0 });

    // 方法
    const setTheme = (newTheme: Theme) => {
      theme.value = newTheme;
    };

    const setLanguage = (newLanguage: Language) => {
      language.value = newLanguage;
    };

    const setLoading = (loading: boolean) => {
      isLoading.value = loading;
    };

    const getSystemInfo = async () => {
      try {
        const info = await uni.getSystemInfo();
        systemInfo.value = info;
        return info;
      } catch (error) {
        console.error('获取系统信息失败:', error);
        return null;
      }
    };

    const getNetworkType = async () => {
      try {
        const { networkType: type } = await uni.getNetworkType();
        networkType.value = type;
        isOnline.value = type !== 'none';
        return type;
      } catch (error) {
        console.error('获取网络类型失败:', error);
        return 'unknown';
      }
    };

    const showToast = (title: string, icon: 'success' | 'error' | 'loading' | 'none' = 'none', duration = 2000) => {
      uni.showToast({
        title,
        icon,
        duration,
      });
    };

    const showLoading = (title = '加载中...') => {
      uni.showLoading({ title });
    };

    const hideLoading = () => {
      uni.hideLoading();
    };

    const showModal = (options: {
      title?: string;
      content: string;
      showCancel?: boolean;
      cancelText?: string;
      confirmText?: string;
    }) => {
      return new Promise<boolean>((resolve) => {
        uni.showModal({
          title: options.title || '提示',
          content: options.content,
          showCancel: options.showCancel !== false,
          cancelText: options.cancelText || '取消',
          confirmText: options.confirmText || '确定',
          success: (res) => {
            resolve(res.confirm);
          },
          fail: () => {
            resolve(false);
          },
        });
      });
    };

    const navigateTo = (url: string, params?: Record<string, any>) => {
      let fullUrl = url;
      if (params) {
        const query = Object.keys(params)
          .map(key => `${key}=${encodeURIComponent(params[key])}`)
          .join('&');
        fullUrl += `?${query}`;
      }
      
      uni.navigateTo({ url: fullUrl });
    };

    const redirectTo = (url: string, params?: Record<string, any>) => {
      let fullUrl = url;
      if (params) {
        const query = Object.keys(params)
          .map(key => `${key}=${encodeURIComponent(params[key])}`)
          .join('&');
        fullUrl += `?${query}`;
      }
      
      uni.redirectTo({ url: fullUrl });
    };

    const switchTab = (url: string) => {
      uni.switchTab({ url });
    };

    const navigateBack = (delta = 1) => {
      uni.navigateBack({ delta });
    };

    // 初始化
    const init = async () => {
      await Promise.all([
        getSystemInfo(),
        getNetworkType(),
      ]);
    };

    return {
      // 状态
      theme,
      language,
      isLoading,
      systemInfo,
      networkType,
      isOnline,
      
      // 计算属性
      isDarkMode,
      isIOS,
      isAndroid,
      statusBarHeight,
      safeAreaInsets,
      
      // 方法
      setTheme,
      setLanguage,
      setLoading,
      getSystemInfo,
      getNetworkType,
      showToast,
      showLoading,
      hideLoading,
      showModal,
      navigateTo,
      redirectTo,
      switchTab,
      navigateBack,
      init,
    };
  },
  {
    persist: {
      key: 'app-store',
      paths: ['theme', 'language'],
    },
  }
);