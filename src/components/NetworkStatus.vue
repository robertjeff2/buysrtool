<template>
  <view 
    v-if="showNetworkStatus" 
    class="network-status"
    :class="{
      'network-offline': !isOnline,
      'network-slow': isSlowNetwork,
      'network-status--fixed': fixed
    }"
  >
    <view class="status-content">
      <view class="status-icon">
        <text class="icon">{{ statusIcon }}</text>
      </view>
      
      <view class="status-text">
        <text class="message">{{ statusMessage }}</text>
        <text v-if="showDetails" class="details">{{ statusDetails }}</text>
      </view>
      
      <view v-if="showRetryButton" class="status-actions">
        <button 
          class="retry-btn"
          @click="handleRetry"
          :loading="retrying"
        >
          重试
        </button>
      </view>
      
      <view v-if="closable" class="status-close" @click="handleClose">
        <text class="close-icon">×</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { NETWORK_TYPES } from '@/constants';

// Props
interface Props {
  // 是否固定显示
  fixed?: boolean;
  // 是否可关闭
  closable?: boolean;
  // 是否显示详细信息
  showDetails?: boolean;
  // 是否显示重试按钮
  showRetryButton?: boolean;
  // 自动隐藏时间（毫秒，0表示不自动隐藏）
  autoHideDelay?: number;
  // 重试回调
  onRetry?: () => void | Promise<void>;
}

const props = withDefaults(defineProps<Props>(), {
  fixed: true,
  closable: true,
  showDetails: true,
  showRetryButton: true,
  autoHideDelay: 0,
});

// Emits
const emit = defineEmits(['statusChange', 'retry', 'close']);

// 状态
const isOnline = ref(true);
const networkType = ref<string>('unknown');
const isSlowNetwork = ref(false);
const showNetworkStatus = ref(false);
const retrying = ref(false);
const manuallyHidden = ref(false);

// 网络监听器
let networkStatusTimer: number | null = null;
let autoHideTimer: number | null = null;

// 计算属性
const statusIcon = computed(() => {
  if (!isOnline.value) return '📡';
  if (isSlowNetwork.value) return '🐌';
  return '✅';
});

const statusMessage = computed(() => {
  if (!isOnline.value) return '网络连接已断开';
  if (isSlowNetwork.value) return '网络连接较慢';
  return '网络连接正常';
});

const statusDetails = computed(() => {
  if (!props.showDetails) return '';
  
  const typeMap: Record<string, string> = {
    [NETWORK_TYPES.WIFI]: 'WiFi',
    [NETWORK_TYPES.CELLULAR_4G]: '4G',
    [NETWORK_TYPES.CELLULAR_3G]: '3G',
    [NETWORK_TYPES.CELLULAR_2G]: '2G',
    [NETWORK_TYPES.ETHERNET]: '以太网',
    [NETWORK_TYPES.UNKNOWN]: '未知',
    [NETWORK_TYPES.NONE]: '无网络',
  };
  
  const typeText = typeMap[networkType.value] || '未知';
  
  if (!isOnline.value) {
    return '请检查网络设置';
  }
  
  if (isSlowNetwork.value) {
    return `当前网络：${typeText}，建议切换到更稳定的网络`;
  }
  
  return `当前网络：${typeText}`;
});

// 获取网络状态
const getNetworkStatus = (): Promise<{ isConnected: boolean; networkType: string }> => {
  return new Promise((resolve) => {
    uni.getNetworkType({
      success: (res) => {
        const isConnected = res.networkType !== 'none';
        resolve({
          isConnected,
          networkType: res.networkType,
        });
      },
      fail: () => {
        resolve({
          isConnected: false,
          networkType: 'unknown',
        });
      },
    });
  });
};

// 检测网络速度
const checkNetworkSpeed = async (): Promise<boolean> => {
  try {
    const startTime = Date.now();
    
    // 发送一个小的网络请求来测试速度

    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // 如果请求时间超过3秒，认为是慢网络
    return duration > 3000;
  } catch {
    // 请求失败，可能是网络问题
    return true;
  }
};

// 更新网络状态
const updateNetworkStatus = async () => {
  try {
    const { isConnected, networkType: type } = await getNetworkStatus();
    
    const wasOnline = isOnline.value;
    const wasSlowNetwork = isSlowNetwork.value;
    
    isOnline.value = isConnected;
    networkType.value = type;
    
    // 如果网络连接正常，检测网络速度
    if (isConnected) {
      isSlowNetwork.value = await checkNetworkSpeed();
    } else {
      isSlowNetwork.value = false;
    }
    
    // 判断是否需要显示状态提示
    const shouldShow = !isOnline.value || isSlowNetwork.value;
    const statusChanged = 
      wasOnline !== isOnline.value || 
      wasSlowNetwork !== isSlowNetwork.value;
    
    if (statusChanged) {
      if (shouldShow && !manuallyHidden.value) {
        showNetworkStatus.value = true;
        
        // 设置自动隐藏
        if (props.autoHideDelay > 0) {
          if (autoHideTimer) {
            clearTimeout(autoHideTimer);
          }
          autoHideTimer = setTimeout(() => {
            showNetworkStatus.value = false;
          }, props.autoHideDelay);
        }
      } else if (!shouldShow) {
        showNetworkStatus.value = false;
        manuallyHidden.value = false;
      }
      
      // 发送状态变化事件
      emit('statusChange', {
        isOnline: isOnline.value,
        networkType: networkType.value,
        isSlowNetwork: isSlowNetwork.value,
      });
    }
  } catch (error) {
    console.error('Failed to update network status:', error);
  }
};

// 开始监听网络状态
const startNetworkMonitoring = () => {
  // 立即检查一次
  updateNetworkStatus();
  
  // 设置定时检查
  networkStatusTimer = setInterval(updateNetworkStatus, 10000); // 每10秒检查一次
  
  // 监听网络状态变化事件
  uni.onNetworkStatusChange((res) => {
    console.log('Network status changed:', res);
    updateNetworkStatus();
  });
};

// 停止监听网络状态
const stopNetworkMonitoring = () => {
  if (networkStatusTimer) {
    clearInterval(networkStatusTimer);
    networkStatusTimer = null;
  }
  
  if (autoHideTimer) {
    clearTimeout(autoHideTimer);
    autoHideTimer = null;
  }
  
  uni.offNetworkStatusChange();
};

// 重试处理
const handleRetry = async () => {
  if (retrying.value) return;
  
  try {
    retrying.value = true;
    
    if (props.onRetry) {
      await props.onRetry();
    }
    
    // 重新检查网络状态
    await updateNetworkStatus();
    
    emit('retry');
  } catch (error) {
    console.error('Retry failed:', error);
  } finally {
    retrying.value = false;
  }
};

// 关闭处理
const handleClose = () => {
  showNetworkStatus.value = false;
  manuallyHidden.value = true;
  
  if (autoHideTimer) {
    clearTimeout(autoHideTimer);
    autoHideTimer = null;
  }
  
  emit('close');
};

// 手动显示状态
const showStatus = () => {
  manuallyHidden.value = false;
  updateNetworkStatus();
};

// 手动隐藏状态
const hideStatus = () => {
  handleClose();
};

// 生命周期
onMounted(() => {
  startNetworkMonitoring();
});

onUnmounted(() => {
  stopNetworkMonitoring();
});

// 暴露方法
defineExpose({
  showStatus,
  hideStatus,
  updateNetworkStatus,
  isOnline: () => isOnline.value,
  networkType: () => networkType.value,
  isSlowNetwork: () => isSlowNetwork.value,
});
</script>

<style lang="scss" scoped>
.network-status {
  position: relative;
  width: 100%;
  background: #fff;
  border-bottom: 1rpx solid #eee;
  z-index: 1000;
  
  &.network-status--fixed {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
  }
  
  &.network-offline {
    background: #ff4757;
    color: white;
    
    .retry-btn {
      background: rgba(255, 255, 255, 0.2);
      color: white;
      border-color: rgba(255, 255, 255, 0.3);
      
      &:active {
        background: rgba(255, 255, 255, 0.3);
      }
    }
  }
  
  &.network-slow {
    background: #ffa502;
    color: white;
    
    .retry-btn {
      background: rgba(255, 255, 255, 0.2);
      color: white;
      border-color: rgba(255, 255, 255, 0.3);
      
      &:active {
        background: rgba(255, 255, 255, 0.3);
      }
    }
  }
}

.status-content {
  display: flex;
  align-items: center;
  padding: 20rpx 32rpx;
  gap: 24rpx;
}

.status-icon {
  .icon {
    font-size: 32rpx;
    line-height: 1;
  }
}

.status-text {
  flex: 1;
  
  .message {
    display: block;
    font-size: 28rpx;
    font-weight: 500;
    line-height: 1.4;
  }
  
  .details {
    display: block;
    font-size: 24rpx;
    opacity: 0.8;
    line-height: 1.3;
    margin-top: 4rpx;
  }
}

.status-actions {
  .retry-btn {
    padding: 12rpx 24rpx;
    background: #007AFF;
    color: white;
    border: 1rpx solid #007AFF;
    border-radius: 8rpx;
    font-size: 24rpx;
    font-weight: 500;
    
    &:active {
      background: #0056CC;
    }
    
    &[loading] {
      opacity: 0.7;
    }
  }
}

.status-close {
  padding: 8rpx;
  
  .close-icon {
    font-size: 36rpx;
    line-height: 1;
    opacity: 0.6;
  }
  
  &:active {
    .close-icon {
      opacity: 1;
    }
  }
}

/* 深色主题适配 */
@media (prefers-color-scheme: dark) {
  .network-status {
    background: #2a2a2a;
    border-color: #444;
    color: #fff;
    
    &:not(.network-offline):not(.network-slow) {
      .retry-btn {
        background: #007AFF;
        color: white;
        border-color: #007AFF;
      }
    }
  }
}
</style>