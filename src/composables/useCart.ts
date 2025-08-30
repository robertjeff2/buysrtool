// 购物车相关的组合式函数
import { ref, computed, reactive, readonly } from 'vue';
import type { Product, CartItem, CartState } from '@/types/product';
import { CACHE_KEYS, EVENTS } from '@/constants';

// 购物车状态
const cartState = reactive<CartState>({
  items: [],
  total: 0,
  count: 0,
});

// 从本地存储加载购物车数据
const loadCartFromStorage = () => {
  try {
    const stored = uni.getStorageSync(CACHE_KEYS.CART_DATA);
    if (stored) {
      const data = JSON.parse(stored);
      cartState.items = data.items || [];
      updateCartTotals();
    }
  } catch (error) {
    console.error('加载购物车数据失败:', error);
  }
};

// 保存购物车数据到本地存储
const saveCartToStorage = () => {
  try {
    const data = {
      items: cartState.items,
      timestamp: Date.now(),
    };
    uni.setStorageSync(CACHE_KEYS.CART_DATA, JSON.stringify(data));
  } catch (error) {
    console.error('保存购物车数据失败:', error);
  }
};

// 更新购物车统计信息
const updateCartTotals = () => {
  cartState.count = cartState.items.reduce((sum, item) => sum + item.quantity, 0);
  cartState.total = cartState.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
};

// 购物车组合式函数
export const useCart = () => {
  // 初始化购物车
  const initCart = () => {
    loadCartFromStorage();
  };

  // 添加商品到购物车
  const addToCart = (product: Product, quantity = 1, selectedSize?: string, selectedColor?: string) => {
    const existingIndex = cartState.items.findIndex(
      item => item.product.id === product.id && 
              item.selectedSize === selectedSize && 
              item.selectedColor === selectedColor
    );

    if (existingIndex > -1) {
      cartState.items[existingIndex].quantity += quantity;
    } else {
      const newItem: CartItem = {
        id: Date.now(),
        product,
        quantity,
        selectedSize,
        selectedColor,
      };
      cartState.items.push(newItem);
    }

    updateCartTotals();
    saveCartToStorage();
    
    // 触发购物车更新事件
    uni.$emit(EVENTS.CART_UPDATE, { ...cartState });
  };

  // 从购物车移除商品
  const removeFromCart = (itemId: number) => {
    const index = cartState.items.findIndex(item => item.id === itemId);
    if (index > -1) {
      cartState.items.splice(index, 1);
      updateCartTotals();
      saveCartToStorage();
      uni.$emit(EVENTS.CART_UPDATE, { ...cartState });
    }
  };

  // 更新商品数量
  const updateQuantity = (itemId: number, quantity: number) => {
    const item = cartState.items.find(item => item.id === itemId);
    if (item) {
      if (quantity <= 0) {
        removeFromCart(itemId);
      } else {
        item.quantity = quantity;
        updateCartTotals();
        saveCartToStorage();
        uni.$emit(EVENTS.CART_UPDATE, { ...cartState });
      }
    }
  };

  // 清空购物车
  const clearCart = () => {
    cartState.items = [];
    updateCartTotals();
    saveCartToStorage();
    uni.$emit(EVENTS.CART_UPDATE, { ...cartState });
  };

  // 检查商品是否在购物车中
  const isInCart = (productId: number) => {
    return cartState.items.some(item => item.product.id === productId);
  };

  // 获取商品在购物车中的数量
  const getProductQuantity = (productId: number) => {
    return cartState.items
      .filter(item => item.product.id === productId)
      .reduce((sum, item) => sum + item.quantity, 0);
  };

  return {
    // 状态
    cartState: readonly(cartState),
    cartItems: computed(() => cartState.items),
    cartCount: computed(() => cartState.count),
    cartTotal: computed(() => cartState.total),
    
    // 方法
    initCart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isInCart,
    getProductQuantity,
  };
};