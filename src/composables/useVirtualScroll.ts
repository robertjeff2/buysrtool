// 虚拟滚动组合式函数
import { ref, computed, reactive, onMounted, onUnmounted, nextTick, readonly } from 'vue';
import type { Ref } from 'vue';

interface VirtualScrollOptions {
  itemHeight: number; // 每项高度
  containerHeight: number; // 容器高度
  buffer?: number; // 缓冲区项目数量
  threshold?: number; // 滚动阈值
}

interface VirtualScrollState {
  scrollTop: number;
  startIndex: number;
  endIndex: number;
  visibleCount: number;
  totalHeight: number;
  offsetY: number;
}

export const useVirtualScroll = <T = any>(
  list: Ref<T[]>,
  options: VirtualScrollOptions
) => {
  const {
    itemHeight,
    containerHeight,
    buffer = 5,
    threshold = 0,
  } = options;

  // 状态
  const state = reactive<VirtualScrollState>({
    scrollTop: 0,
    startIndex: 0,
    endIndex: 0,
    visibleCount: Math.ceil(containerHeight / itemHeight),
    totalHeight: 0,
    offsetY: 0,
  });

  // 容器引用
  const containerRef = ref<HTMLElement>();
  const listRef = ref<HTMLElement>();

  // 计算属性
  const visibleData = computed(() => {
    const start = Math.max(0, state.startIndex - buffer);
    const end = Math.min(list.value.length, state.endIndex + buffer);
    return list.value.slice(start, end).map((item, index) => ({
      item,
      index: start + index,
      key: start + index,
    }));
  });

  console.log(visibleData)

  const listStyle = computed(() => ({
    height: `${state.totalHeight}px`,
    transform: `translateY(${state.offsetY}px)`,
  }));

  const containerStyle = computed(() => ({
    height: `${containerHeight}px`,
    overflow: 'auto',
  }));

  // 更新可见范围
  const updateVisibleRange = () => {
    const scrollTop = state.scrollTop;
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      list.value.length - 1,
      startIndex + state.visibleCount
    );

    state.startIndex = startIndex;
    state.endIndex = endIndex;
    state.offsetY = Math.max(0, (startIndex - buffer) * itemHeight);
  };

  // 更新总高度
  const updateTotalHeight = () => {
    state.totalHeight = list.value.length * itemHeight;
  };

  // 滚动处理
  let scrollTimer: number | null = null;
  const handleScroll = (event: Event) => {
    const target = event.target as HTMLElement;
    state.scrollTop = target.scrollTop;

    if (scrollTimer) {
      clearTimeout(scrollTimer);
    }

    scrollTimer = setTimeout(() => {
      updateVisibleRange();
      scrollTimer = null;
    }, 16); // 约60fps
  };

  // 滚动到指定索引
  const scrollToIndex = (index: number, behavior: ScrollBehavior = 'smooth') => {
    if (!containerRef.value) return;

    const targetScrollTop = index * itemHeight;
    containerRef.value.scrollTo({
      top: targetScrollTop,
      behavior,
    });
  };

  // 滚动到顶部
  const scrollToTop = (behavior: ScrollBehavior = 'smooth') => {
    scrollToIndex(0, behavior);
  };

  // 滚动到底部
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    scrollToIndex(list.value.length - 1, behavior);
  };

  // 获取项目位置信息
  const getItemPosition = (index: number) => {
    return {
      top: index * itemHeight,
      bottom: (index + 1) * itemHeight,
      height: itemHeight,
    };
  };

  // 检查项目是否可见
  const isItemVisible = (index: number) => {
    const { top, bottom } = getItemPosition(index);
    const scrollTop = state.scrollTop;
    const scrollBottom = scrollTop + containerHeight;
    
    return bottom > scrollTop && top < scrollBottom;
  };

  // 获取可见项目索引范围
  const getVisibleRange = () => {
    return {
      start: state.startIndex,
      end: state.endIndex,
      visible: state.endIndex - state.startIndex + 1,
    };
  };

  // 重新计算
  const recalculate = async () => {
    await nextTick();
    updateTotalHeight();
    updateVisibleRange();
  };

  // 重置滚动位置
  const reset = () => {
    state.scrollTop = 0;
    state.startIndex = 0;
    state.endIndex = Math.min(list.value.length - 1, state.visibleCount);
    state.offsetY = 0;
    
    if (containerRef.value) {
      containerRef.value.scrollTop = 0;
    }
  };

  // 监听列表变化
  const unwatchList = computed(() => list.value.length);
  const stopWatching = ref(false);

  const watchListChanges = () => {
    if (stopWatching.value) return;
    
    const currentLength = unwatchList.value;
    updateTotalHeight();
    
    // 如果列表变短，可能需要调整滚动位置
    if (state.startIndex >= currentLength) {
      reset();
    } else {
      updateVisibleRange();
    }
  };

  // 生命周期
  onMounted(() => {
    if (containerRef.value) {
      containerRef.value.addEventListener('scroll', handleScroll, { passive: true });
    }
    
    updateTotalHeight();
    updateVisibleRange();
    
    // 监听列表变化
    const unwatch = computed(watchListChanges);
    
    onUnmounted(() => {
      stopWatching.value = true;
      if (containerRef.value) {
        containerRef.value.removeEventListener('scroll', handleScroll);
      }
      if (scrollTimer) {
        clearTimeout(scrollTimer);
      }
    });
  });

  return {
    // 引用
    containerRef,
    listRef,
    
    // 状态
    state: readonly(state),
    
    // 计算属性
    visibleData,
    listStyle,
    containerStyle,
    
    // 方法
    scrollToIndex,
    scrollToTop,
    scrollToBottom,
    getItemPosition,
    isItemVisible,
    getVisibleRange,
    recalculate,
    reset,
    
    // 工具方法
    updateVisibleRange,
    updateTotalHeight,
  };
};

// 动态高度虚拟滚动（更复杂的实现）
export const useDynamicVirtualScroll = <T = any>(
  list: Ref<T[]>,
  options: {
    containerHeight: number;
    estimatedItemHeight: number;
    buffer?: number;
  }
) => {
  const { containerHeight, estimatedItemHeight, buffer = 5 } = options;
  
  // 存储每个项目的实际高度
  const itemHeights = ref<Map<number, number>>(new Map());
  const itemPositions = ref<Map<number, number>>(new Map());
  
  // 更新项目高度
  const updateItemHeight = (index: number, height: number) => {
    itemHeights.value.set(index, height);
    updatePositions();
  };
  
  // 更新所有项目位置
  const updatePositions = () => {
    let totalHeight = 0;
    
    for (let i = 0; i < list.value.length; i++) {
      itemPositions.value.set(i, totalHeight);
      const height = itemHeights.value.get(i) || estimatedItemHeight;
      totalHeight += height;
    }
  };
  
  // 获取项目位置
  const getItemPosition = (index: number) => {
    const top = itemPositions.value.get(index) || 0;
    const height = itemHeights.value.get(index) || estimatedItemHeight;
    
    return {
      top,
      bottom: top + height,
      height,
    };
  };
  
  return {
    updateItemHeight,
    getItemPosition,
    itemHeights: readonly(itemHeights),
    itemPositions: readonly(itemPositions),
  };
};