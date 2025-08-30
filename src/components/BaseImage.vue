<template>
  <image
    :src="currentSrc"
    :mode="mode"
    :lazy-load="lazyLoad"
    :fade-show="fadeShow"
    :webp="webp"
    :show-menu-by-longpress="showMenuByLongpress"
    :class="[
      'base-image',
      {
        'base-image--loading': isLoading,
        'base-image--error': hasError,
        'base-image--loaded': isLoaded,
      }
    ]"
    :style="imageStyle"
    @load="handleLoad"
    @error="handleError"
    @click="handleClick"
  />
  
  <!-- 加载状态 -->
  <view v-if="showPlaceholder && isLoading" class="base-image__placeholder">
    <slot name="loading">
      <view class="base-image__loading">
        <text class="base-image__loading-text">加载中...</text>
      </view>
    </slot>
  </view>
  
  <!-- 错误状态 -->
  <view v-if="showPlaceholder && hasError" class="base-image__placeholder">
    <slot name="error">
      <view class="base-image__error">
        <text class="base-image__error-text">加载失败</text>
      </view>
    </slot>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { preloadImage } from '@/composables/useLazyLoad';

interface Props {
  src: string;
  mode?: 'scaleToFill' | 'aspectFit' | 'aspectFill' | 'widthFix' | 'heightFix' | 'top' | 'bottom' | 'center' | 'left' | 'right' | 'top left' | 'top right' | 'bottom left' | 'bottom right';
  lazyLoad?: boolean;
  fadeShow?: boolean;
  webp?: boolean;
  showMenuByLongpress?: boolean;
  placeholder?: string;
  errorImage?: string;
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  preload?: boolean;
  showPlaceholder?: boolean;
  retryCount?: number;
  retryDelay?: number;
}

interface Emits {
  load: [event: Event];
  error: [event: Event];
  click: [event: Event];
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'aspectFill',
  lazyLoad: true,
  fadeShow: true,
  webp: true,
  showMenuByLongpress: false,
  placeholder: '',
  errorImage: '',
  preload: false,
  showPlaceholder: true,
  retryCount: 3,
  retryDelay: 1000,
});

const emit = defineEmits<Emits>();

// 状态
const isLoading = ref(true);
const hasError = ref(false);
const isLoaded = ref(false);
const currentRetryCount = ref(0);
const currentSrc = ref('');

// 计算属性
const imageStyle = computed(() => {
  const style: Record<string, string> = {};
  
  if (props.width) {
    style.width = typeof props.width === 'number' ? `${props.width}px` : props.width;
  }
  
  if (props.height) {
    style.height = typeof props.height === 'number' ? `${props.height}px` : props.height;
  }
  
  if (props.borderRadius) {
    style.borderRadius = typeof props.borderRadius === 'number' ? `${props.borderRadius}px` : props.borderRadius;
  }
  
  return style;
});

// 重试加载
const retryLoad = async () => {
  if (currentRetryCount.value >= props.retryCount) {
    hasError.value = true;
    isLoading.value = false;
    return;
  }
  
  currentRetryCount.value++;
  
  // 延迟重试
  await new Promise(resolve => setTimeout(resolve, props.retryDelay));
  
  // 重新设置图片源
  currentSrc.value = '';
  setTimeout(() => {
    currentSrc.value = props.src;
  }, 100);
};

// 事件处理
const handleLoad = (event: Event) => {
  isLoading.value = false;
  hasError.value = false;
  isLoaded.value = true;
  currentRetryCount.value = 0;
  emit('load', event);
};

const handleError = (event: Event) => {
  if (props.errorImage && currentSrc.value !== props.errorImage) {
    currentSrc.value = props.errorImage;
    return;
  }
  
  if (currentRetryCount.value < props.retryCount) {
    retryLoad();
    return;
  }
  
  isLoading.value = false;
  hasError.value = true;
  isLoaded.value = false;
  emit('error', event);
};

const handleClick = (event: Event) => {
  emit('click', event);
};

// 初始化图片源
const initImageSrc = () => {
  if (props.placeholder && !props.src) {
    currentSrc.value = props.placeholder;
    return;
  }
  
  currentSrc.value = props.src;
  
  // 预加载
  if (props.preload && props.src) {
    preloadImage(props.src).catch(() => {
      // 预加载失败，使用正常加载流程
    });
  }
};

// 监听 src 变化
watch(
  () => props.src,
  (newSrc) => {
    if (newSrc !== currentSrc.value) {
      isLoading.value = true;
      hasError.value = false;
      isLoaded.value = false;
      currentRetryCount.value = 0;
      currentSrc.value = newSrc;
    }
  }
);

onMounted(() => {
  initImageSrc();
});
</script>

<style lang="scss" scoped>
.base-image {
  display: block;
  width: 100%;
  height: 100%;
  transition: opacity 0.3s ease;
  
  &--loading {
    opacity: 0.6;
  }
  
  &--error {
    opacity: 0.5;
  }
  
  &--loaded {
    opacity: 1;
  }
}

.base-image__placeholder {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
}

.base-image__loading,
.base-image__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 12px;
}

.base-image__loading-text,
.base-image__error-text {
  margin-top: 8px;
}
</style>