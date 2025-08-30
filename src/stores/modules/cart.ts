// 购物车状态管理
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Product, CartItem } from '@/types/product';

export const useCartStore = defineStore(
  'cart',
  () => {
    // 状态
    const items = ref<CartItem[]>([]);
    const loading = ref(false);
    const error = ref<string>('');

    // 计算属性
    const count = computed(() => {
      return items.value.reduce((total, item) => total + item.quantity, 0);
    });

    const total = computed(() => {
      return items.value.reduce((total, item) => {
        return total + (item.product.price * item.quantity);
      }, 0);
    });

    const isEmpty = computed(() => items.value.length === 0);

    const itemsGroupedByCategory = computed(() => {
      const groups: Record<string, CartItem[]> = {};
      
      items.value.forEach(item => {
        const category = item.product.category;
        if (!groups[category]) {
          groups[category] = [];
        }
        groups[category].push(item);
      });
      
      return groups;
    });

    // 方法
    const addItem = (product: Product, quantity = 1, selectedSize?: string, selectedColor?: string) => {
      const existingItemIndex = items.value.findIndex(item => 
        item.product.id === product.id &&
        item.selectedSize === selectedSize &&
        item.selectedColor === selectedColor
      );

      if (existingItemIndex > -1) {
        // 如果商品已存在，增加数量
        items.value[existingItemIndex].quantity += quantity;
      } else {
        // 添加新商品
        const newItem: CartItem = {
          id: Date.now(), // 简单的ID生成
          product,
          quantity,
          selectedSize,
          selectedColor,
        };
        items.value.push(newItem);
      }
    };

    const removeItem = (itemId: number) => {
      const index = items.value.findIndex(item => item.id === itemId);
      if (index > -1) {
        items.value.splice(index, 1);
      }
    };

    const updateQuantity = (itemId: number, quantity: number) => {
      const item = items.value.find(item => item.id === itemId);
      if (item) {
        if (quantity <= 0) {
          removeItem(itemId);
        } else {
          item.quantity = quantity;
        }
      }
    };

    const increaseQuantity = (itemId: number) => {
      const item = items.value.find(item => item.id === itemId);
      if (item) {
        item.quantity++;
      }
    };

    const decreaseQuantity = (itemId: number) => {
      const item = items.value.find(item => item.id === itemId);
      if (item) {
        if (item.quantity > 1) {
          item.quantity--;
        } else {
          removeItem(itemId);
        }
      }
    };

    const clearCart = () => {
      items.value = [];
    };

    const getItemById = (itemId: number): CartItem | undefined => {
      return items.value.find(item => item.id === itemId);
    };

    const getItemsByProductId = (productId: string): CartItem[] => {
      return items.value.filter(item => item.product.id === productId);
    };

    const hasProduct = (productId: string, selectedSize?: string, selectedColor?: string): boolean => {
      return items.value.some(item => 
        item.product.id === productId &&
        item.selectedSize === selectedSize &&
        item.selectedColor === selectedColor
      );
    };

    const getProductQuantity = (productId: string, selectedSize?: string, selectedColor?: string): number => {
      const item = items.value.find(item => 
        item.product.id === productId &&
        item.selectedSize === selectedSize &&
        item.selectedColor === selectedColor
      );
      return item ? item.quantity : 0;
    };

    // 批量操作
    const addMultipleItems = (products: Array<{ product: Product; quantity: number; selectedSize?: string; selectedColor?: string }>) => {
      products.forEach(({ product, quantity, selectedSize, selectedColor }) => {
        addItem(product, quantity, selectedSize, selectedColor);
      });
    };

    const removeMultipleItems = (itemIds: number[]) => {
      itemIds.forEach(id => removeItem(id));
    };

    const selectAllItems = () => {
      return items.value.map(item => ({ ...item, selected: true }));
    };

    const unselectAllItems = () => {
      return items.value.map(item => ({ ...item, selected: false }));
    };

    // 结算相关
    const getSelectedItems = () => {
      return items.value.filter(item => (item as any).selected);
    };

    const getSelectedTotal = () => {
      return getSelectedItems().reduce((total, item) => {
        return total + (item.product.price * item.quantity);
      }, 0);
    };

    const getSelectedCount = () => {
      return getSelectedItems().reduce((total, item) => total + item.quantity, 0);
    };

    // 本地存储同步
    const saveToStorage = () => {
      try {
        uni.setStorageSync('cart-items', JSON.stringify(items.value));
      } catch (error) {
        console.error('保存购物车到本地存储失败:', error);
      }
    };

    const loadFromStorage = () => {
      try {
        const stored = uni.getStorageSync('cart-items');
        if (stored) {
          items.value = JSON.parse(stored);
        }
      } catch (error) {
        console.error('从本地存储加载购物车失败:', error);
      }
    };

    // 订单相关
    const createOrder = async (orderData: any) => {
      try {
        loading.value = true;
        error.value = '';
        
        // 模拟创建订单API调用
        const response = await mockCreateOrder({
          items: getSelectedItems(),
          total: getSelectedTotal(),
          ...orderData,
        });
        
        if (response.success) {
          // 清除已下单的商品
          const selectedItemIds = getSelectedItems().map(item => item.id);
          removeMultipleItems(selectedItemIds);
          
          return response;
        } else {
          error.value = response.message || '创建订单失败';
          return response;
        }
      } catch (err) {
        error.value = err instanceof Error ? err.message : '创建订单失败';
        return { success: false, message: error.value };
      } finally {
        loading.value = false;
      }
    };

    // 初始化
    const init = () => {
      loadFromStorage();
    };

    return {
      // 状态
      items,
      loading,
      error,
      
      // 计算属性
      count,
      total,
      isEmpty,
      itemsGroupedByCategory,
      
      // 方法
      addItem,
      removeItem,
      updateQuantity,
      increaseQuantity,
      decreaseQuantity,
      clearCart,
      getItemById,
      getItemsByProductId,
      hasProduct,
      getProductQuantity,
      addMultipleItems,
      removeMultipleItems,
      selectAllItems,
      unselectAllItems,
      getSelectedItems,
      getSelectedTotal,
      getSelectedCount,
      saveToStorage,
      loadFromStorage,
      createOrder,
      init,
    };
  },
  {
    persist: true,
  }
);

// 模拟API函数
const mockCreateOrder = async (orderData: any) => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 模拟订单创建
  const orderId = 'ORDER_' + Date.now();
  
  return {
    success: true,
    data: {
      orderId,
      status: 'pending',
      ...orderData,
    },
    message: '订单创建成功',
  };
};