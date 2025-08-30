// 性能监控组合式函数
import { ref, onMounted, onUnmounted, readonly } from 'vue';
import type { Ref } from 'vue';

interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  loadTime: number;
  renderTime: number;
  interactionTime: number;
}

interface PerformanceOptions {
  enableFPS?: boolean;
  enableMemory?: boolean;
  enableTiming?: boolean;
  sampleInterval?: number;
}

// 性能监控
export const usePerformance = (options: PerformanceOptions = {}) => {
  const {
    enableFPS = true,
    enableMemory = true,
    enableTiming = true,
    sampleInterval = 1000,
  } = options;

  const metrics = ref<PerformanceMetrics>({
    fps: 0,
    memoryUsage: 0,
    loadTime: 0,
    renderTime: 0,
    interactionTime: 0,
  });

  const isMonitoring = ref(false);
  let animationId: number | null = null;
  let intervalId: number | null = null;
  let frameCount = 0;
  let lastTime = performance.now();

  // FPS 监控
  const measureFPS = () => {
    if (!enableFPS) return;

    const now = performance.now();
    frameCount++;

    if (now - lastTime >= 1000) {
      metrics.value.fps = Math.round((frameCount * 1000) / (now - lastTime));
      frameCount = 0;
      lastTime = now;
    }

    if (isMonitoring.value) {
      animationId = requestAnimationFrame(measureFPS);
    }
  };

  // 内存使用监控
  const measureMemory = () => {
    if (!enableMemory) return;

    // @ts-ignore - performance.memory 可能不存在
    if (performance.memory) {
      // @ts-ignore
      const memory = performance.memory;
      metrics.value.memoryUsage = Math.round(
        (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
      );
    }
  };

  // 页面加载时间
  const measureLoadTime = () => {
    if (!enableTiming) return;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      metrics.value.loadTime = Math.round(
        navigation.loadEventEnd - navigation.fetchStart
      );
    }
  };

  // 渲染时间监控
  const measureRenderTime = () => {
    if (!enableTiming) return;

    const paintEntries = performance.getEntriesByType('paint');
    const firstContentfulPaint = paintEntries.find(
      entry => entry.name === 'first-contentful-paint'
    );
    
    if (firstContentfulPaint) {
      metrics.value.renderTime = Math.round(firstContentfulPaint.startTime);
    }
  };

  // 交互时间监控
  const measureInteractionTime = (callback?: (time: number) => void) => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const interactionTime = endTime - startTime;
      metrics.value.interactionTime = Math.round(interactionTime);
      
      if (callback) {
        callback(interactionTime);
      }
      
      return interactionTime;
    };
  };

  // 开始监控
  const startMonitoring = () => {
    if (isMonitoring.value) return;
    
    isMonitoring.value = true;
    
    if (enableFPS) {
      measureFPS();
    }
    
    if (enableMemory || enableTiming) {
      intervalId = setInterval(() => {
        measureMemory();
        measureLoadTime();
        measureRenderTime();
      }, sampleInterval);
    }
  };

  // 停止监控
  const stopMonitoring = () => {
    isMonitoring.value = false;
    
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
    
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };

  // 重置指标
  const resetMetrics = () => {
    metrics.value = {
      fps: 0,
      memoryUsage: 0,
      loadTime: 0,
      renderTime: 0,
      interactionTime: 0,
    };
    frameCount = 0;
    lastTime = performance.now();
  };

  // 获取性能报告
  const getPerformanceReport = () => {
    return {
      ...metrics.value,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };
  };

  // 性能警告阈值
  const thresholds = {
    fps: 30,
    memoryUsage: 80,
    loadTime: 3000,
    renderTime: 1000,
    interactionTime: 100,
  };

  // 检查性能警告
  const checkPerformanceWarnings = () => {
    const warnings: string[] = [];
    
    if (metrics.value.fps < thresholds.fps) {
      warnings.push(`FPS过低: ${metrics.value.fps}`);
    }
    
    if (metrics.value.memoryUsage > thresholds.memoryUsage) {
      warnings.push(`内存使用过高: ${metrics.value.memoryUsage}%`);
    }
    
    if (metrics.value.loadTime > thresholds.loadTime) {
      warnings.push(`加载时间过长: ${metrics.value.loadTime}ms`);
    }
    
    if (metrics.value.renderTime > thresholds.renderTime) {
      warnings.push(`渲染时间过长: ${metrics.value.renderTime}ms`);
    }
    
    if (metrics.value.interactionTime > thresholds.interactionTime) {
      warnings.push(`交互响应过慢: ${metrics.value.interactionTime}ms`);
    }
    
    return warnings;
  };

  onMounted(() => {
    startMonitoring();
  });

  onUnmounted(() => {
    stopMonitoring();
  });

  return {
    metrics: readonly(metrics),
    isMonitoring: readonly(isMonitoring),
    startMonitoring,
    stopMonitoring,
    resetMetrics,
    measureInteractionTime,
    getPerformanceReport,
    checkPerformanceWarnings,
  };
};

// 页面性能监控
export const usePagePerformance = () => {
  const loadStartTime = ref(0);
  const loadEndTime = ref(0);
  const renderStartTime = ref(0);
  const renderEndTime = ref(0);

  // 开始加载计时
  const startLoadTiming = () => {
    loadStartTime.value = performance.now();
  };

  // 结束加载计时
  const endLoadTiming = () => {
    loadEndTime.value = performance.now();
  };

  // 开始渲染计时
  const startRenderTiming = () => {
    renderStartTime.value = performance.now();
  };

  // 结束渲染计时
  const endRenderTiming = () => {
    renderEndTime.value = performance.now();
  };

  // 获取加载时间
  const getLoadTime = () => {
    return loadEndTime.value - loadStartTime.value;
  };

  // 获取渲染时间
  const getRenderTime = () => {
    return renderEndTime.value - renderStartTime.value;
  };

  return {
    startLoadTiming,
    endLoadTiming,
    startRenderTiming,
    endRenderTiming,
    getLoadTime,
    getRenderTime,
  };
};

// 组件性能监控装饰器
export const withPerformanceMonitoring = <T extends Record<string, any>>(
  component: T,
  componentName: string
): T => {
  const originalMounted = component.mounted;
  const originalUpdated = component.updated;
  const originalUnmounted = component.unmounted;

  return {
    ...component,
    mounted() {
      const startTime = performance.now();
      
      if (originalMounted) {
        originalMounted.call(this);
      }
      
      const endTime = performance.now();
      console.log(`[Performance] ${componentName} mounted in ${endTime - startTime}ms`);
    },
    
    updated() {
      const startTime = performance.now();
      
      if (originalUpdated) {
        originalUpdated.call(this);
      }
      
      const endTime = performance.now();
      console.log(`[Performance] ${componentName} updated in ${endTime - startTime}ms`);
    },
    
    unmounted() {
      const startTime = performance.now();
      
      if (originalUnmounted) {
        originalUnmounted.call(this);
      }
      
      const endTime = performance.now();
      console.log(`[Performance] ${componentName} unmounted in ${endTime - startTime}ms`);
    },
  };
};