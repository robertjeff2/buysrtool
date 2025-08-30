// 图片懒加载组合式函数
import { ref, onMounted, onUnmounted } from 'vue';
import type { Ref } from 'vue';

interface LazyLoadOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
  placeholder?: string;
  errorImage?: string;
}

interface LazyImageItem {
  element: HTMLImageElement;
  src: string;
  loaded: boolean;
  error: boolean;
}

// 图片懒加载
export const useLazyLoad = (options: LazyLoadOptions = {}) => {
  const {
    root = null,
    rootMargin = '50px',
    threshold = 0.1,
    placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+',
    errorImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkVycm9yPC90ZXh0Pjwvc3ZnPg==',
  } = options;

  const observer = ref<IntersectionObserver | null>(null);
  const imageMap = new Map<HTMLImageElement, LazyImageItem>();

  // 加载图片
  const loadImage = (item: LazyImageItem): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        item.element.src = item.src;
        item.loaded = true;
        item.element.classList.add('lazy-loaded');
        resolve();
      };
      
      img.onerror = () => {
        item.element.src = errorImage;
        item.error = true;
        item.element.classList.add('lazy-error');
        reject(new Error(`Failed to load image: ${item.src}`));
      };
      
      img.src = item.src;
    });
  };

  // 处理交叉观察
  const handleIntersection = (entries: IntersectionObserverEntry[]) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        const item = imageMap.get(img);
        
        if (item && !item.loaded && !item.error) {
          loadImage(item).catch(console.error);
          observer.value?.unobserve(img);
        }
      }
    });
  };

  // 初始化观察器
  const initObserver = () => {
    if (typeof IntersectionObserver !== 'undefined') {
      observer.value = new IntersectionObserver(handleIntersection, {
        root,
        rootMargin,
        threshold,
      });
    }
  };

  // 添加图片到懒加载
  const addImage = (element: HTMLImageElement, src: string) => {
    if (!element || !src) return;

    // 设置占位图
    element.src = placeholder;
    element.classList.add('lazy-loading');

    const item: LazyImageItem = {
      element,
      src,
      loaded: false,
      error: false,
    };

    imageMap.set(element, item);

    if (observer.value) {
      observer.value.observe(element);
    } else {
      // 降级处理：直接加载图片
      loadImage(item).catch(console.error);
    }
  };

  // 移除图片
  const removeImage = (element: HTMLImageElement) => {
    if (observer.value) {
      observer.value.unobserve(element);
    }
    imageMap.delete(element);
  };

  // 强制加载所有图片
  const loadAllImages = async () => {
    const promises = Array.from(imageMap.values())
      .filter(item => !item.loaded && !item.error)
      .map(item => loadImage(item).catch(console.error));
    
    await Promise.all(promises);
  };

  // 清理
  const cleanup = () => {
    if (observer.value) {
      observer.value.disconnect();
      observer.value = null;
    }
    imageMap.clear();
  };

  onMounted(() => {
    initObserver();
  });

  onUnmounted(() => {
    cleanup();
  });

  return {
    addImage,
    removeImage,
    loadAllImages,
    cleanup,
  };
};

// 图片懒加载指令
export const vLazyLoad = {
  mounted(el: HTMLImageElement, binding: { value: string }) {
    const { addImage } = useLazyLoad();
    addImage(el, binding.value);
  },
  
  updated(el: HTMLImageElement, binding: { value: string; oldValue?: string }) {
    if (binding.value !== binding.oldValue) {
      const { removeImage, addImage } = useLazyLoad();
      removeImage(el);
      addImage(el, binding.value);
    }
  },
  
  unmounted(el: HTMLImageElement) {
    const { removeImage } = useLazyLoad();
    removeImage(el);
  },
};

// 预加载图片
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to preload image: ${src}`));
    img.src = src;
  });
};

// 批量预加载图片
export const preloadImages = async (srcs: string[]): Promise<void> => {
  const promises = srcs.map(src => preloadImage(src).catch(console.error));
  await Promise.all(promises);
};