<template>
  <view class="error-boundary">
    <!-- 正常内容 -->
    <slot v-if="!hasError" />
    
    <!-- 错误状态 -->
    <view v-else class="error-content">
      <view class="error-icon">
        <text class="icon">⚠️</text>
      </view>
      
      <view class="error-message">
        <text class="title">{{ errorTitle }}</text>
        <text class="description">{{ errorMessage }}</text>
      </view>
      
      <view class="error-actions">
        <button 
          class="retry-btn" 
          @click="handleRetry"
          :loading="retrying"
        >
          {{ retrying ? '重试中...' : '重试' }}
        </button>
        
        <button 
          v-if="showReportButton"
          class="report-btn" 
          @click="handleReport"
        >
          反馈问题
        </button>
      </view>
      
      <!-- 开发模式下显示详细错误信息 -->
      <view v-if="isDevelopment && errorDetails" class="error-details">
        <text class="details-title">错误详情（开发模式）：</text>
        <text class="details-content">{{ errorDetails }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onErrorCaptured } from 'vue';
import { handleError, ErrorLevel } from '@/utils/errorHandler';
import { ERROR_CODES } from '@/constants';

// Props
interface Props {
  // 自定义错误标题
  errorTitle?: string;
  // 自定义错误消息
  errorMessage?: string;
  // 是否显示反馈按钮
  showReportButton?: boolean;
  // 重试回调
  onRetry?: () => void | Promise<void>;
  // 反馈回调
  onReport?: (error: Error) => void;
  // 是否在错误时显示详细信息
  showDetails?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  errorTitle: '出现了一些问题',
  errorMessage: '页面加载失败，请稍后重试',
  showReportButton: true,
  showDetails: false,
});

// Emits
const emit = defineEmits<{
  error: [error: Error];
  retry: [];
  report: [error: Error];
}>();

// 状态
const hasError = ref(false);
const currentError = ref<Error | null>(null);
const retrying = ref(false);

// 计算属性
const isDevelopment = computed(() => {
  // 在开发环境中显示详细错误信息
  return process.env.NODE_ENV === 'development';
});

const errorDetails = computed(() => {
  if (!currentError.value || !props.showDetails) return '';
  return currentError.value.stack || currentError.value.message;
});

// 错误捕获
onErrorCaptured((error: Error) => {
  console.error('ErrorBoundary caught error:', error);
  
  hasError.value = true;
  currentError.value = error;
  
  // 上报错误
  handleError({
    code: ERROR_CODES.INTERNAL_ERROR,
    message: error.message,
    stack: error.stack,
  }, ErrorLevel.ERROR);
  
  emit('error', error);
  
  // 阻止错误继续向上传播
  return false;
});

// 重试处理
const handleRetry = async () => {
  if (retrying.value) return;
  
  try {
    retrying.value = true;
    
    if (props.onRetry) {
      await props.onRetry();
    }
    
    // 重置错误状态
    hasError.value = false;
    currentError.value = null;
    
    emit('retry');
  } catch (error) {
    console.error('Retry failed:', error);
    
    // 重试失败，显示新的错误信息
    if (error instanceof Error) {
      currentError.value = error;
      handleError({
        code: ERROR_CODES.INTERNAL_ERROR,
        message: `重试失败: ${error.message}`,
        stack: error.stack,
      }, ErrorLevel.ERROR);
    }
  } finally {
    retrying.value = false;
  }
};

// 反馈处理
const handleReport = () => {
  if (!currentError.value) return;
  
  if (props.onReport) {
    props.onReport(currentError.value);
  } else {
    // 默认反馈行为：复制错误信息到剪贴板
    const errorInfo = {
      message: currentError.value.message,
      stack: currentError.value.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };
    
    uni.setClipboardData({
      data: JSON.stringify(errorInfo, null, 2),
      success: () => {
        uni.showToast({
          title: '错误信息已复制到剪贴板',
          icon: 'success',
        });
      },
    });
  }
  
  emit('report', currentError.value);
};

// 手动触发错误（用于测试）
const triggerError = (error: Error) => {
  hasError.value = true;
  currentError.value = error;
  
  handleError({
    code: ERROR_CODES.INTERNAL_ERROR,
    message: error.message,
    stack: error.stack,
  }, ErrorLevel.ERROR);
  
  emit('error', error);
};

// 重置错误状态
const resetError = () => {
  hasError.value = false;
  currentError.value = null;
};

// 暴露方法
defineExpose({
  triggerError,
  resetError,
  hasError: () => hasError.value,
  currentError: () => currentError.value,
});
</script>

<style lang="scss" scoped>
.error-boundary {
  width: 100%;
  height: 100%;
}

.error-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60rpx 40rpx;
  min-height: 400rpx;
  text-align: center;
}

.error-icon {
  margin-bottom: 40rpx;
  
  .icon {
    font-size: 120rpx;
    line-height: 1;
  }
}

.error-message {
  margin-bottom: 60rpx;
  
  .title {
    display: block;
    font-size: 36rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 20rpx;
    line-height: 1.4;
  }
  
  .description {
    display: block;
    font-size: 28rpx;
    color: #666;
    line-height: 1.5;
  }
}

.error-actions {
  display: flex;
  gap: 24rpx;
  margin-bottom: 40rpx;
}

.retry-btn {
  padding: 24rpx 48rpx;
  background: #007AFF;
  color: white;
  border: none;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: 500;
  
  &:active {
    background: #0056CC;
  }
  
  &[loading] {
    opacity: 0.7;
  }
}

.report-btn {
  padding: 24rpx 48rpx;
  background: transparent;
  color: #007AFF;
  border: 2rpx solid #007AFF;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: 500;
  
  &:active {
    background: rgba(0, 122, 255, 0.1);
  }
}

.error-details {
  width: 100%;
  max-width: 600rpx;
  padding: 24rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  text-align: left;
  
  .details-title {
    display: block;
    font-size: 24rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 16rpx;
  }
  
  .details-content {
    display: block;
    font-size: 20rpx;
    color: #666;
    line-height: 1.4;
    word-break: break-all;
    white-space: pre-wrap;
  }
}

/* 深色主题适配 */
@media (prefers-color-scheme: dark) {
  .error-content {
    background: #1a1a1a;
  }
  
  .error-message {
    .title {
      color: #fff;
    }
    
    .description {
      color: #ccc;
    }
  }
  
  .error-details {
    background: #2a2a2a;
    
    .details-title {
      color: #fff;
    }
    
    .details-content {
      color: #ccc;
    }
  }
}
</style>