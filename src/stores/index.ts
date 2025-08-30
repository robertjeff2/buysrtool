// Pinia store 入口文件
import { createPinia } from 'pinia';
import { createPersistedState } from 'pinia-plugin-persistedstate';

// 创建 pinia 实例
const pinia = createPinia();

// 添加持久化插件
pinia.use(
  createPersistedState({
    storage: {
      getItem: (key: string) => {
        return uni.getStorageSync(key);
      },
      setItem: (key: string, value: string) => {
        uni.setStorageSync(key, value);
      },
      removeItem: (key: string) => {
        uni.removeStorageSync(key);
      },
    },
  })
);

export default pinia;

// 导出所有 store
export * from './modules/app';
export * from './modules/user';
export * from './modules/product';
export * from './modules/cart';