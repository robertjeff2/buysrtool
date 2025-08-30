// 平台检测相关的组合式函数
import { ref, computed } from 'vue';
import type { Platform } from '@/types/common';
import { PLATFORM_MAP } from '@/constants';

// 当前平台
const currentPlatform = ref<Platform>('H5');

// 平台检测
const detectPlatform = (): Platform => {
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
  
  // 默认返回 H5
  return 'H5';
};

// 平台组合式函数
export const usePlatform = () => {
  // 初始化平台检测
  const initPlatform = () => {
    currentPlatform.value = detectPlatform();
  };

  // 平台判断方法
  const isH5 = computed(() => currentPlatform.value === 'H5');
  const isMiniProgram = computed(() => currentPlatform.value.startsWith('MP-'));
  const isWeixin = computed(() => currentPlatform.value === 'MP-WEIXIN');
  const isAlipay = computed(() => currentPlatform.value === 'MP-ALIPAY');
  const isBaidu = computed(() => currentPlatform.value === 'MP-BAIDU');
  const isToutiao = computed(() => currentPlatform.value === 'MP-TOUTIAO');
  const isQQ = computed(() => currentPlatform.value === 'MP-QQ');
  const isApp = computed(() => currentPlatform.value === 'APP-PLUS');

  // 获取平台特定的配置
  const getPlatformConfig = () => {
    const configs = {
      'H5': {
        canShare: true,
        canSaveImage: true,
        canVibrate: false,
        storageLimit: '5MB',
      },
      'MP-WEIXIN': {
        canShare: true,
        canSaveImage: true,
        canVibrate: true,
        storageLimit: '10MB',
      },
      'MP-ALIPAY': {
        canShare: true,
        canSaveImage: true,
        canVibrate: true,
        storageLimit: '10MB',
      },
      'MP-BAIDU': {
        canShare: true,
        canSaveImage: true,
        canVibrate: true,
        storageLimit: '10MB',
      },
      'MP-TOUTIAO': {
        canShare: true,
        canSaveImage: true,
        canVibrate: true,
        storageLimit: '10MB',
      },
      'MP-QQ': {
        canShare: true,
        canSaveImage: true,
        canVibrate: true,
        storageLimit: '10MB',
      },
      'APP-PLUS': {
        canShare: true,
        canSaveImage: true,
        canVibrate: true,
        storageLimit: 'unlimited',
      },
    };
    
    return configs[currentPlatform.value] || configs['H5'];
  };

  // 平台特定的API调用
  const showToast = (title: string, icon: 'success' | 'error' | 'loading' | 'none' = 'none') => {
    uni.showToast({
      title,
      icon,
      duration: 2000,
    });
  };

  const showModal = (title: string, content: string) => {
    return new Promise<boolean>((resolve) => {
      uni.showModal({
        title,
        content,
        success: (res) => {
          resolve(res.confirm);
        },
        fail: () => {
          resolve(false);
        },
      });
    });
  };

  const vibrate = () => {
    const config = getPlatformConfig();
    if (config.canVibrate) {
      uni.vibrateShort({
        type: 'medium',
      });
    }
  };

  const saveImageToPhotosAlbum = (filePath: string) => {
    return new Promise<boolean>((resolve) => {
      const config = getPlatformConfig();
      if (!config.canSaveImage) {
        showToast('当前平台不支持保存图片', 'error');
        resolve(false);
        return;
      }

      uni.saveImageToPhotosAlbum({
        filePath,
        success: () => {
          showToast('保存成功', 'success');
          resolve(true);
        },
        fail: (err) => {
          console.error('保存图片失败:', err);
          showToast('保存失败', 'error');
          resolve(false);
        },
      });
    });
  };

  return {
    // 状态
    platform: computed(() => currentPlatform.value),
    
    // 平台判断
    isH5,
    isMiniProgram,
    isWeixin,
    isAlipay,
    isBaidu,
    isToutiao,
    isQQ,
    isApp,
    
    // 方法
    initPlatform,
    getPlatformConfig,
    showToast,
    showModal,
    vibrate,
    saveImageToPhotosAlbum,
  };
};