// 用户状态管理
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

interface UserInfo {
  id: string;
  nickname: string;
  avatar: string;
  phone?: string;
  email?: string;
  gender?: 'male' | 'female' | 'unknown';
  birthday?: string;
  address?: string;
  vipLevel?: number;
  points?: number;
}

interface LoginParams {
  username: string;
  password: string;
}

interface RegisterParams {
  username: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  email?: string;
}

export const useUserStore = defineStore(
  'user',
  () => {
    // 状态
    const token = ref<string>('');
    const userInfo = ref<UserInfo | null>(null);
    const isLoggedIn = ref(false);
    const loginTime = ref<number>(0);
    const favorites = ref<string[]>([]);
    const browseHistory = ref<string[]>([]);

    // 计算属性
    const isVip = computed(() => (userInfo.value?.vipLevel || 0) > 0);
    const displayName = computed(() => userInfo.value?.nickname || '未登录');
    const avatarUrl = computed(() => userInfo.value?.avatar || '/static/imgs/default-avatar.png');
    const userPoints = computed(() => userInfo.value?.points || 0);

    // 方法
    const setToken = (newToken: string) => {
      token.value = newToken;
      isLoggedIn.value = !!newToken;
      if (newToken) {
        loginTime.value = Date.now();
      }
    };

    const setUserInfo = (info: UserInfo) => {
      userInfo.value = info;
    };

    const updateUserInfo = (updates: Partial<UserInfo>) => {
      if (userInfo.value) {
        userInfo.value = { ...userInfo.value, ...updates };
      }
    };

    // 登录
    const login = async (params: LoginParams): Promise<boolean> => {
      try {
        // 模拟登录 API 调用
        const response = await mockLogin(params);
        
        if (response.success && response.token && response.userInfo) {
          setToken(response.token);
          setUserInfo(response.userInfo);
          return true;
        }
        
        return false;
      } catch (error) {
        console.error('登录失败:', error);
        return false;
      }
    };

    // 注册
    const register = async (params: RegisterParams): Promise<boolean> => {
      try {
        // 模拟注册 API 调用
        const response = await mockRegister(params);
        
        if (response.success && response.token && response.userInfo) {
          setToken(response.token);
          setUserInfo(response.userInfo);
          return true;
        }
        
        return false;
      } catch (error) {
        console.error('注册失败:', error);
        return false;
      }
    };

    // 登出
    const logout = () => {
      token.value = '';
      userInfo.value = null;
      isLoggedIn.value = false;
      loginTime.value = 0;
      favorites.value = [];
      browseHistory.value = [];
    };

    // 刷新用户信息
    const refreshUserInfo = async (): Promise<boolean> => {
      if (!token.value) return false;
      
      try {
        // 模拟获取用户信息 API 调用
        const response = await mockGetUserInfo(token.value);
        
        if (response.success) {
          setUserInfo(response.userInfo);
          return true;
        }
        
        return false;
      } catch (error) {
        console.error('获取用户信息失败:', error);
        return false;
      }
    };

    // 添加收藏
    const addFavorite = (productId: string) => {
      if (!favorites.value.includes(productId)) {
        favorites.value.push(productId);
      }
    };

    // 移除收藏
    const removeFavorite = (productId: string) => {
      const index = favorites.value.indexOf(productId);
      if (index > -1) {
        favorites.value.splice(index, 1);
      }
    };

    // 检查是否收藏
    const isFavorite = (productId: string) => {
      return favorites.value.includes(productId);
    };

    // 添加浏览历史
    const addBrowseHistory = (productId: string) => {
      // 移除已存在的记录
      const index = browseHistory.value.indexOf(productId);
      if (index > -1) {
        browseHistory.value.splice(index, 1);
      }
      
      // 添加到开头
      browseHistory.value.unshift(productId);
      
      // 限制历史记录数量
      if (browseHistory.value.length > 50) {
        browseHistory.value = browseHistory.value.slice(0, 50);
      }
    };

    // 清空浏览历史
    const clearBrowseHistory = () => {
      browseHistory.value = [];
    };

    // 检查登录状态
    const checkLoginStatus = () => {
      if (!token.value || !isLoggedIn.value) {
        return false;
      }
      
      // 检查登录是否过期（7天）
      const now = Date.now();
      const expireTime = 7 * 24 * 60 * 60 * 1000; // 7天
      
      if (now - loginTime.value > expireTime) {
        logout();
        return false;
      }
      
      return true;
    };

    return {
      // 状态
      token,
      userInfo,
      isLoggedIn,
      loginTime,
      favorites,
      browseHistory,
      
      // 计算属性
      isVip,
      displayName,
      avatarUrl,
      userPoints,
      
      // 方法
      setToken,
      setUserInfo,
      updateUserInfo,
      login,
      register,
      logout,
      refreshUserInfo,
      addFavorite,
      removeFavorite,
      isFavorite,
      addBrowseHistory,
      clearBrowseHistory,
      checkLoginStatus,
    };
  },
  {
    persist: true,
  }
);

// 模拟 API 函数
const mockLogin = async (params: LoginParams) => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 模拟登录验证
  if (params.username === 'demo' && params.password === '123456') {
    return {
      success: true,
      token: 'mock-token-' + Date.now(),
      userInfo: {
        id: '1',
        nickname: '演示用户',
        avatar: '/static/imgs/default-avatar.png',
        phone: '138****8888',
        vipLevel: 1,
        points: 1000,
      },
    };
  }
  
  return {
    success: false,
    message: '用户名或密码错误',
  };
};

const mockRegister = async (params: RegisterParams) => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 模拟注册
  return {
    success: true,
    token: 'mock-token-' + Date.now(),
    userInfo: {
      id: Date.now().toString(),
      nickname: params.username,
      avatar: '/static/imgs/default-avatar.png',
      phone: params.phone,
      email: params.email,
      vipLevel: 0,
      points: 0,
    },
  };
};

const mockGetUserInfo = async (token: string) => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    success: true,
    userInfo: {
      id: '1',
      nickname: '演示用户',
      avatar: '/static/imgs/default-avatar.png',
      phone: '138****8888',
      vipLevel: 1,
      points: 1000,
    },
  };
};