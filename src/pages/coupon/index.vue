<template>
  <view class="coupon-container">

    
    <!-- 顶部标题区域 -->
    <view class="header-section">
      <img src="@/static/imgs/top.png" class="header-image" />
    </view>

    <!-- 分类选择器 -->
    <view class="category-section">
      <view class="category-container">
        <view
          v-for="category in categories"
          :key="category.id"
          class="category-item"
          :class="{ active: currentCategory === category.id }"
          @click="setCategory(category.id)"
        >
          <text class="category-text">{{ category.name }}</text>
        </view>
      </view>
    </view>

    <!-- 搜索框 -->
    <view class="search-section">
      <view class="search-container">
        <view class="search-input-wrapper">
          <text class="search-icon">🔍</text>
          <input
            class="search-input"
            type="text"
            placeholder="搜索商品名称、分类或关键词..."
            v-model="searchKeyword"
            @input="handleSearchWithPerformance"
          />
          <view class="clear-button" v-if="searchKeyword" @click="clearSearch">
            <text class="clear-icon">✕</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 商品列表区域 -->
    <view class="products-section">
      <ErrorBoundary>
        <!-- 虚拟滚动容器（商品数量多时使用） -->
        <view 
          v-if="enableVirtualScroll"
          ref="containerRef"
          class="virtual-scroll-container"
          @scroll="handleScroll"
        >
          <view ref="listRef" class="virtual-scroll-list">
            <ProductCard
              v-for="(item,index) in visibleData"
              :key="index"
              :product="item.item"
              :is-selected="isProductSelected(item.id)"
              :show-quantity-control="true"
              @click="handleProductClick(item.id)"
              @add-remove="handleAddRemoveClick(item.id)"
              :style="{ transform: `translateY(${item.top}px)` }"
            />
          </view>
        </view>
        
        <!-- 普通网格布局（商品数量少时使用） -->
        <view v-else class="products-grid">
          <ProductCard
            v-for="product in filteredProducts"
            :key="product.id"
            :product="product"
            :is-selected="isProductSelected(product.id)"
            :show-quantity-control="true"
            @click="handleProductClick(product.id)"
            @add-remove="handleAddRemoveClick(product.id)"
          />
        </view>
      </ErrorBoundary>
    </view>

    <!-- 底部汇总区域 -->
    <view class="summary-section">
      <view class="summary-blur">
        <view class="summary-content">
          <view class="target-section">
            <view class="unified-target">
              <view class="next-target">
                <text class="next-text">
                  {{
                    totalPrice >= 999
                      ? '🎉 所有赠品已获得！'
                      : totalPrice >= 329
                      ? `还差¥${999 - totalPrice}获得牛仔包`
                      : totalPrice > 0
                      ? `还差¥${329 - totalPrice}获得徽章`
                      : '开始购物获得编织袋'
                  }}
                </text>
              </view>

              <view class="progress-track">
                <view class="progress-line">
                  <view
                    class="progress-fill"
                    :style="{
                      width: Math.min((totalPrice / 999) * 100, 100) + '%'
                    }"
                  ></view>
                </view>

                <view class="milestone-points">
                  <view
                    class="milestone milestone-0"
                    :class="{ achieved: totalPrice > 0 }"
                  >
                    <view class="milestone-dot"></view>
                    <view class="milestone-info">
                      <text class="milestone-label">编织袋</text>
                      <text class="milestone-amount">¥0</text>
                    </view>
                  </view>

                  <view
                    class="milestone milestone-329"
                    :class="{ achieved: totalPrice >= 329 }"
                  >
                    <view class="milestone-dot"></view>
                    <view class="milestone-info">
                      <text class="milestone-label">徽章</text>
                      <text class="milestone-amount">¥329</text>
                    </view>
                  </view>

                  <view
                    class="milestone milestone-999"
                    :class="{ achieved: totalPrice >= 999 }"
                  >
                    <view class="milestone-dot"></view>
                    <view class="milestone-info">
                      <text class="milestone-label">牛仔包</text>
                      <text class="milestone-amount">¥999</text>
                    </view>
                  </view>
                </view>
              </view>
              <view class="target-header">
                <text class="target-title">总计</text>
                <text class="current-amount">¥{{ totalPrice }}</text>
                <view class="header-right">
                  <view class="cart-button" @click="showCartDialog = true">
                    <text class="cart-icon">🛒</text>
                    <text class="cart-text"
                      >查看方案 ({{ selectedProducts.length }})</text
                    >
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
  <el-dialog
    v-model="showCartDialog"
    width="90%"
    custom-class="bottom-dialog"
    :modal-append-to-body="false"
    :append-to-body="true"
    :before-close="() => (showCartDialog = false)"
    :close-on-click-modal="true"
    :show-close="false"
    class="cart-dialog"
    v-if="showCartDialog"
  >
      <!-- 标题编辑区域 -->
      <div class="cart-title-section">
        <div v-if="!isEditingTitle" class="title-display">
          <span class="title-text">{{ cartTitle }}</span>
          <button class="edit-title-btn" @click="startEditTitle">✏️</button>
        </div>
        <div v-else class="title-edit">
          <input
            v-model="cartTitle"
            class="title-input"
            @blur="finishEditTitle"
            @keyup.enter="finishEditTitle"
            ref="titleInput"
            maxlength="20"
            placeholder="请输入方案名称"
          />
          <button class="save-title-btn" @click="finishEditTitle">✓</button>
        </div>
      </div>

      <div class="cart-items" @click="resetSwipeState">
        <div v-if="selectedProducts.length === 0" class="empty-cart">
          <el-empty description="购物车为空" />
        </div>
        <div v-else>
          <div
            v-for="item in selectedProducts"
            :key="item.id"
            class="cart-item-wrapper"
          >
            <!-- 删除背景 -->
            <div
              class="delete-background"
              :style="{
                opacity:
                  (swipeDistance[item.id] || 0) > 0
                    ? Math.min((swipeDistance[item.id] || 0) / 100, 1)
                    : 0
              }"
            >
              <div class="delete-text">删除</div>
            </div>

            <div
              class="cart-item-container"
              :style="{
                transform: `translateX(-${swipeDistance[item.id] || 0}px)`,
                opacity: deletingItems.has(item.id) ? 0 : 1,
                transition: isSwiping
                  ? 'none'
                  : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }"
              @touchstart="handleTouchStart($event, item.id)"
              @touchmove="handleTouchMove($event, item.id)"
              @touchend="handleTouchEnd($event, item.id)"
            >
              <div class="cart-item">
                <div class="cart-item-info">
                  <el-image
                    :src="item.image"
                    class="cart-item-image"
                    fit="contain"
                  ></el-image>
                  <div class="cart-item-details">
                    <div class="cart-item-name">{{ item.name }}</div>
                    <div class="cart-item-specs">
                      {{ item.color }} / {{ item.size }}
                    </div>
                    <div class="cart-item-price">{{ item.price }}元</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 赠品区域 -->
          <div class="gift-section" v-if="giftItems.length > 0">
            <div class="gift-items">
              🎁 赠品
              <div v-for="gift in giftItems" :key="gift.name" class="gift-item">
                <div class="gift-icon">{{ gift.icon }}</div>
                <div class="gift-name">{{ gift.name }}</div>
              </div>
            </div>
          </div>
          <div class="cart-total">
            <span>总计: {{ totalPrice }}元</span>
          </div>
          

        </div>
      </div>
    </el-dialog>

  <!-- 尺码颜色选择弹窗 -->
  <el-dialog
      title="选择规格"
      v-model="showSizeColorDialog"
      width="90%"
      custom-class="size-color-dialog"
      :modal-append-to-body="false"
      :append-to-body="true"
      :before-close="() => (showSizeColorDialog = false)"
      :close-on-click-modal="true"
      v-if="showSizeColorDialog && currentSelectingProduct"
    >
      <div class="size-color-content">
        <!-- 商品信息 -->
        <div class="product-info">
          <el-image
            :src="currentSelectingProduct.image"
            class="product-image"
            fit="contain"
          ></el-image>
          <div class="product-details">
            <div class="product-name">{{ currentSelectingProduct.name }}</div>
            <div class="product-price">
              ¥{{ currentSelectingProduct.price }}
            </div>
          </div>
        </div>

        <!-- 尺码选择 -->
        <div
          class="spec-section"
          v-if="
            currentSelectingProduct.sizes &&
            currentSelectingProduct.sizes.length > 0
          "
        >
          <div class="spec-title">尺码</div>
          <div class="spec-options">
            <div
              v-for="size in currentSelectingProduct.sizes"
              :key="size"
              class="spec-option"
              :class="{ selected: selectedSize === size }"
              @click="selectedSize = size"
            >
              {{ size }}
            </div>
          </div>
        </div>

        <!-- 颜色选择 -->
        <div
          class="spec-section"
          v-if="
            currentSelectingProduct.colors &&
            currentSelectingProduct.colors.length > 0
          "
        >
          <div class="spec-title">颜色</div>
          <div class="spec-options">
            <div
              v-for="color in currentSelectingProduct.colors"
              :key="color"
              class="spec-option"
              :class="{ selected: selectedColor === color }"
              @click="selectedColor = color"
            >
              {{ color }}
            </div>
          </div>
        </div>

        <!-- 确认按钮 -->
        <div class="confirm-section">
          <el-button
            type="primary"
            class="confirm-button"
            @click="confirmAddToCart"
            :disabled="!canConfirm"
          >
            确认添加到购物车
          </el-button>
        </div>
      </div>
    </el-dialog>


</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from 'vue';
// 导入组合式函数
import { useProducts } from '@/composables/useProducts';
import { useCart } from '@/composables/useCart';
import { useLazyLoad } from '@/composables/useLazyLoad';
import { useVirtualScroll } from '@/composables/useVirtualScroll';
import { usePagePerformance } from '@/composables/usePerformance';
// 导入组件
import ProductCard from '@/components/ProductCard.vue';
import BaseImage from '@/components/BaseImage.vue';
import ErrorBoundary from '@/components/ErrorBoundary.vue';


// 使用组合式函数
const {
  products,
  categories,
  currentCategory,
  searchKeyword,
  loading,
  error,
  filteredProducts,
  loadProducts,
  recordSearchSectionPosition,
  setCategory,
  searchProducts,
  clearSearch
} = useProducts();

const {
  cartItems,
  cartTotal,
  cartCount,
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  isInCart
} = useCart();

const { lazyLoadRef, isVisible } = useLazyLoad();

// 性能监控
const { startLoadTiming, endLoadTiming, getLoadTime } = usePagePerformance();

// 虚拟滚动（当商品数量较多时启用）
const enableVirtualScroll = computed(() => filteredProducts.value.length > 50);
const {
  containerRef,
  listRef,
  visibleData,
  scrollToIndex,
  handleScroll
} = useVirtualScroll(filteredProducts, {
  itemHeight: 280, // 商品卡片高度
  containerHeight: 600, // 容器高度
  buffer: 3
});
// 页面状态
const showCartDialog = ref<boolean>(false);
const selectedProducts = ref<any[]>([]);

// 购物车标题相关状态
const cartTitle = ref<string>('方案清单');
const isEditingTitle = ref<boolean>(false);

// 尺码颜色选择弹窗相关状态
const showSizeColorDialog = ref<boolean>(false);
const currentSelectingProduct = ref<any>(null);
const selectedSize = ref<string>('');
const selectedColor = ref<string>('');

// 滑动删除相关状态
const touchStartX = ref<number>(0);
const touchStartY = ref<number>(0);
const isSwiping = ref<boolean>(false);
const swipeDistance = ref<{ [key: string]: number }>({});
const deletingItems = ref<Set<string>>(new Set());



// 分类数据已通过 useProducts 组合式函数提供
// 计算属性
const requiresSize = computed(() => {
  return (
    currentSelectingProduct.value?.sizes &&
    currentSelectingProduct.value.sizes.length > 0
  );
});

const requiresColor = computed(() => {
  return (
    currentSelectingProduct.value?.colors &&
    currentSelectingProduct.value.colors.length > 0
  );
});

const canConfirm = computed(() => {
  const sizeValid = !requiresSize.value || selectedSize.value;
  const colorValid = !requiresColor.value || selectedColor.value;
  return sizeValid && colorValid;
});

// 生命周期钩子
onMounted(async () => {
  startLoadTiming();
  await loadProducts();
  endLoadTiming();
  
  // 输出性能指标
  console.log('页面加载时间:', getLoadTime(), 'ms');
  
  // 记录搜索框初始位置
  nextTick(() => {
    recordSearchSectionPosition();
  });
});

// 搜索性能优化
const handleSearchWithPerformance = () => {
  const searchStart = performance.now();
  searchProducts({ keyword: searchKeyword.value });
  const searchEnd = performance.now();
  console.log('搜索耗时:', searchEnd - searchStart, 'ms');
};

// setCategory 方法已通过 useProducts 组合式函数提供

// 处理商品点击
const handleProductClick = (productId: string) => {
  const product = products.value.find((p) => p.id === productId);
  if (product) {
    // 检查商品是否有尺码和颜色选择
    const hasSizes = product.sizes && product.sizes.length > 0;
    const hasColors = product.colors && product.colors.length > 0;

    if (hasSizes || hasColors) {
      // 有规格选择，打开弹窗
      currentSelectingProduct.value = product;
      selectedSize.value = '';
      selectedColor.value = '';
      showSizeColorDialog.value = true;
    } else {
      // 没有规格选择，直接添加到购物车
      addToCart(product, {
        size: '标准款',
        color: '默认'
      });
      
      // 同时添加到本地选中列表（用于页面显示）
      const cartItem = {
        id: Date.now(),
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        size: '标准款',
        color: '默认',
        category: product.category
      };
      selectedProducts.value.push(cartItem);

      uni.showToast({
        title: '已添加到购物车',
        icon: 'success'
      });
    }
  }
};

// 处理添加/移除商品点击
const handleAddRemoveClick = (productId: string) => {
  // 检查商品是否已在购物车中
  if (isProductSelected(productId)) {
    // 商品已选中，从购物车中移除最后一个相同商品ID的项目
    const lastIndex = selectedProducts.value
      .map((item) => item.productId)
      .lastIndexOf(productId);
    if (lastIndex !== -1) {
      selectedProducts.value.splice(lastIndex, 1);
    }
    uni.showToast({
      title: '已从购物车移除',
      icon: 'success'
    });
  } else {
    // 商品未选中，添加到购物车
    handleProductClick(productId);
  }
};

// 确认添加到购物车
const confirmAddToCart = () => {
  // 检查必需的选择项
  if (requiresSize.value && !selectedSize.value) {
    uni.showToast({
      title: '请选择尺码',
      icon: 'none'
    });
    return;
  }

  if (requiresColor.value && !selectedColor.value) {
    uni.showToast({
      title: '请选择颜色',
      icon: 'none'
    });
    return;
  }

  // 使用 useCart 组合式函数添加到购物车
  addToCart(currentSelectingProduct.value, {
    size: selectedSize.value || '标准款',
    color: selectedColor.value || '默认'
  });

  // 同时添加到本地选中列表（用于页面显示）
  const cartItem = {
    id: Date.now(), // 使用时间戳作为唯一ID
    productId: currentSelectingProduct.value.id,
    name: currentSelectingProduct.value.name,
    price: currentSelectingProduct.value.price,
    image: currentSelectingProduct.value.image,
    size: selectedSize.value || '标准款',
    color: selectedColor.value || '默认',
    category: currentSelectingProduct.value.category
  };

  selectedProducts.value.push(cartItem);
  showSizeColorDialog.value = false;

  uni.showToast({
    title: '已添加到购物车',
    icon: 'success'
  });
};

// removeFromCart 方法已通过 useCart 组合式函数提供
// 本地移除方法用于滑动删除
const removeFromCartLocal = (cartItemId: number) => {
  selectedProducts.value = selectedProducts.value.filter(
    (item) => item.id !== cartItemId
  );
  // 移除后重置滑动状态
};

// 触摸开始事件
const handleTouchStart = (event: TouchEvent, itemId: string) => {
  touchStartX.value = event.touches[0].clientX;
  touchStartY.value = event.touches[0].clientY;
  isSwiping.value = false;
};

// 触摸移动事件
const handleTouchMove = (event: TouchEvent, itemId: string) => {
  if (!touchStartX.value) return;

  const currentX = event.touches[0].clientX;
  const currentY = event.touches[0].clientY;
  const deltaX = touchStartX.value - currentX;
  const deltaY = Math.abs(touchStartY.value - currentY);

  // 判断是否为水平滑动（左滑）
  if (Math.abs(deltaX) > 10 && deltaY < 50) {
    isSwiping.value = true;
    event.preventDefault();

    // 实时更新滑动距离，限制在0到150px之间
    const distance = Math.max(0, Math.min(deltaX, 150));
    swipeDistance.value = { ...swipeDistance.value, [itemId]: distance };
  }
};

// 触摸结束事件
const handleTouchEnd = (event: TouchEvent, itemId: string) => {
  if (isSwiping.value && touchStartX.value) {
    const currentX = event.changedTouches[0].clientX;
    const deltaX = touchStartX.value - currentX;

    // 左滑超过100px时触发删除动画
    if (deltaX > 100) {
      // 添加删除动画
      deletingItems.value.add(itemId);
      swipeDistance.value = { ...swipeDistance.value, [itemId]: 300 }; // 滑出屏幕

      // 延迟删除，等待动画完成
      setTimeout(() => {
        removeFromCartLocal(itemId);
        deletingItems.value.delete(itemId);
        delete swipeDistance.value[itemId];
      }, 300);
    } else {
      // 滑动距离不够，回弹到原位
      swipeDistance.value = { ...swipeDistance.value, [itemId]: 0 };
      setTimeout(() => {
        delete swipeDistance.value[itemId];
      }, 300);
    }
  } else {
    // 没有滑动，重置距离
    swipeDistance.value = { ...swipeDistance.value, [itemId]: 0 };
    setTimeout(() => {
      delete swipeDistance.value[itemId];
    }, 300);
  }

  // 重置状态
  touchStartX.value = 0;
  touchStartY.value = 0;
  isSwiping.value = false;
};


// 重置滑动状态（点击其他地方时调用）
const resetSwipeState = () => {
  // 重置所有滑动距离到0，添加过渡动画
  Object.keys(swipeDistance.value).forEach((itemId) => {
    swipeDistance.value[itemId] = 0;
  });

  // 延迟清除距离记录
  setTimeout(() => {
    swipeDistance.value = {};
  }, 300);

  touchStartX.value = 0;
  touchStartY.value = 0;
  isSwiping.value = false;
};

// 搜索处理方法已通过 useProducts 组合式函数提供
// handleSearch 和 clearSearch 方法可直接使用

// 标题编辑相关方法
const startEditTitle = () => {
  isEditingTitle.value = true;
  // 使用nextTick确保DOM更新后再聚焦
  nextTick(() => {
    const titleInput = document.querySelector(
      '.title-input'
    ) as HTMLInputElement;
    if (titleInput) {
      titleInput.focus();
      titleInput.select();
    }
  });
};

const finishEditTitle = () => {
  if (cartTitle.value.trim() === '') {
    cartTitle.value = '方案清单';
  }
  isEditingTitle.value = false;
};

// filteredProducts 计算属性已通过 useProducts 组合式函数提供

// 计算已选商品总价
const totalPrice = computed(() => {
  return selectedProducts.value.reduce((sum, item) => {
    return sum + item.price;
  }, 0);
});

// 检查商品是否已选中
const isProductSelected = (productId: string) => {
  return selectedProducts.value.some((item) => item.productId === productId);
};

// 计算赠品
const giftItems = computed(() => {
  const gifts = [];
  const total = totalPrice.value;

  // 任意消费送编织袋
  if (total > 0) {
    gifts.push({
      name: '编织袋',
      icon: '🛍️'
    });
  }

  // 满329送徽章
  if (total >= 329) {
    gifts.push({
      name: '徽章',
      icon: '🏷️'
    });
  }

  // 满999送牛仔包
  if (total >= 999) {
    gifts.push({
      name: '牛仔包',
      icon: '👜'
    });
  }

  return gifts;
});
</script>

<style scoped>
/* 全局容器 */
.coupon-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #ef7721 0%, #ff8a3d 100%);
  padding: 0;
  position: relative;
}

/* 顶部标题区域 */
.header-section {
  padding: 10rpx 25px 0rpx 25px;
  text-align: center;
  position: relative;
  
} 

.header-image {
  width: 100%;
  height: auto;
  max-width: 100%;
  object-fit: contain;
}

.header-blur {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 24rpx;
  padding: 40rpx;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
}

.main-title {
  font-size: 48rpx;
  font-weight: 700;
  color: #ffffff;
  display: block;
  margin-bottom: 12rpx;
  letter-spacing: 1rpx;
}

.subtitle {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 400;
}

/* 分类选择器 */
.category-section {
  padding: 0 40rpx 20rpx 40rpx;
  position: sticky;
  top: 0rpx;
  z-index: 100;
  background: linear-gradient(135deg, #ef7721 0%, #ff8a3d 100%);
  padding-top: 20rpx;
}

.category-container {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 20rpx;
  padding: 12rpx;
  display: flex;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.category-item {
  flex: 1;
  text-align: center;
  padding: 16rpx 8rpx;
  border-radius: 16rpx;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.category-item.active {
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.15);
  transform: scale(1.02);
}

.category-text {
  font-size: 26rpx;
  font-weight: 500;
  color: #ffffff;
  transition: color 0.3s ease;
}

.category-item.active .category-text {
  color: #333333;
  font-weight: 600;
}

/* 搜索框 */
.search-section {
  padding: 0 40rpx 32rpx;
  /* position: sticky;
  top: 255rpx; */
  z-index: 99;
  background: linear-gradient(135deg, #ef7721 0%, #ff8a3d 100%);
  padding-top: 20rpx;
}

.search-container {
  position: relative;
}

.search-input-wrapper {
  position: relative;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 24rpx;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  padding: 0 20rpx;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.search-input-wrapper:focus-within {
  border-color: rgba(239, 119, 33, 0.4);
  box-shadow: 0 4rpx 20rpx rgba(239, 119, 33, 0.2);
}

.search-icon {
  font-size: 32rpx;
  color: #8e8e93;
  margin-right: 16rpx;
}

.search-input {
  flex: 1;
  height: 88rpx;
  border: none;
  outline: none;
  background: transparent;
  font-size: 28rpx;
  color: #1d1d1f;
  padding: 0;
}

.search-input::placeholder {
  color: #8e8e93;
}

.clear-button {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: rgba(142, 142, 147, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.clear-button:active {
  transform: scale(0.9);
  background: rgba(142, 142, 147, 0.2);
}

.clear-icon {
  font-size: 24rpx;
  color: #8e8e93;
  font-weight: 600;
}

/* 商品列表区域 */
.products-section {
  padding: 0 40rpx 365rpx;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx;
  padding-bottom: 0rpx;
}

/* 虚拟滚动样式 */
.virtual-scroll-container {
  height: 600px;
  overflow-y: auto;
  position: relative;
}

.virtual-scroll-list {
  position: relative;
  width: 100%;
}

.virtual-scroll-list .product-card {
  position: absolute;
  width: calc(50% - 12rpx);
  left: 0;
}

.virtual-scroll-list .product-card:nth-child(even) {
  left: calc(50% + 12rpx);
}

/* 商品卡片 */
.product-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 20rpx;
  padding: 10rpx;
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
  cursor: pointer;
}

.product-card:active {
  transform: scale(0.98);
}

.product-card.selected {
  /* background: rgba(239, 119, 33, 0.08); */
  border: 2rpx solid rgba(239, 119, 33, 0.6);
  box-shadow: 0 8rpx 32rpx rgba(239, 119, 33, 0.25);
  transform: translateY(-2rpx);
}

/* 选中状态指示器 */
.selection-indicator {
  position: absolute;
  top: 16rpx;
  right: 16rpx;
  width: 48rpx;
  height: 48rpx;
  background: #ef7721;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  animation: bounceIn 0.3s ease;
  box-shadow: 0 4rpx 12rpx rgba(239, 119, 33, 0.4);
}

.checkmark {
  color: #ffffff;
  font-size: 24rpx;
  font-weight: bold;
}

@keyframes bounceIn {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

/* 商品图片 */
.product-image-container {
  width: 100%;
  height: 240rpx;
  border-radius: 16rpx;
  overflow: hidden;
  margin-bottom: 20rpx;
  background: #f5f5f7;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* 商品详情 */
.product-details {
  margin-bottom: 80rpx; /* 增加底部边距，为添加按钮留出空间 */
}

.product-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #1d1d1f;
  line-height: 1.4;
  margin-bottom: 12rpx;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  align-items: flex-start; /* 改为顶部对齐 */
  gap: 12rpx; /* 添加间距 */
}

.product-price {
  font-size: 32rpx;
  font-weight: 700;
  color: #ff3b30;
  flex-shrink: 0; /* 防止价格被压缩 */
}

.product-category {
  font-size: 22rpx;
  color: #8e8e93;
  background: rgba(142, 142, 147, 0.12);
  padding: 6rpx 12rpx;
  border-radius: 12rpx;
  max-width: 120rpx; /* 限制最大宽度 */
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 添加按钮 */
.add-button {
  position: absolute;
  bottom: 20rpx;
  right: 20rpx;
  width: 56rpx;
  height: 56rpx;
  background: #ef7721;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4rpx 16rpx rgba(239, 119, 33, 0.4);
}

.product-card.selected .add-button {
  background: #ef7721;
  box-shadow: 0 4rpx 16rpx rgba(239, 119, 33, 0.5);
  transform: scale(1.1);
}

.add-button:active {
  transform: scale(0.9);
}

.add-text {
  color: #ffffff;
  font-size: 32rpx;
  font-weight: 600;
  line-height: 1;
}

/* 底部摘要区域 */
.summary-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: 0 25rpx 20rpx 25rpx;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.1) 0%, transparent 100%);
}

.summary-blur {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  border-radius: 16rpx;
  border: 1px solid rgba(255, 255, 255, 0.2);
  /* box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08); */
}

.summary-content {
  /* padding: 16rpx; */
}

.target-section {
  margin-bottom: 12rpx;
}

.unified-target {
  padding: 0 16rpx;
  background: linear-gradient(
    135deg,
    rgba(239, 119, 33, 0.08) 0%,
    rgba(255, 138, 61, 0.05) 100%
  );
  border-radius: 16rpx;
  border: 1rpx solid rgba(239, 119, 33, 0.15);
  box-shadow: 0 4rpx 12rpx rgba(239, 119, 33, 0.1);
}

.target-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.target-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #ef7721;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.current-amount {
  font-size: 36rpx;
  font-weight: 800;
  color: #ef7721;
  background: rgba(239, 119, 33, 0.1);
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
}

.progress-track {
  position: relative;
  margin-bottom: 12rpx;
}

.progress-line {
  height: 8rpx;
  background: rgba(239, 119, 33, 0.2);
  border-radius: 4rpx;
  overflow: hidden;
  margin: 0 40rpx;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #ef7721 0%, #ff8a3d 50%, #34c759 100%);
  border-radius: 4rpx;
  transition: width 0.8s ease;
}

.milestone-points {
  position: relative;
  height: 100rpx;
  margin-top: -12rpx;
  padding: 0 12rpx;
}

.milestone {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  transform: translateX(-50%);
  min-width: 80rpx;
  width: 140rpx;
}

.milestone-0 {
  left: 12rpx;
  transform: translateX(0);
}

.milestone-329 {
  left: calc(32.9% + 12rpx);
}

.milestone-999 {
  left: calc(100% - 20rpx);
  transform: translateX(-100%);
}

.milestone-dot {
  width: 24rpx;
  height: 24rpx;
  border-radius: 50%;
  background: rgba(239, 119, 33, 0.3);
  border: 3rpx solid #fff;
  box-shadow: 0 0 0 2rpx rgba(239, 119, 33, 0.3);
  transition: all 0.3s ease;
  margin-bottom: 8rpx;
}

.milestone.achieved .milestone-dot {
  background: #34c759;
  box-shadow: 0 0 0 2rpx #34c759, 0 0 8rpx rgba(52, 199, 89, 0.4);
  transform: scale(1.2);
}

.milestone-info {
  display: flex !important;
  flex-direction: row !important;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12rpx;
  padding: 8rpx 6rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  border: 1rpx solid rgba(239, 119, 33, 0.2);
  min-width: 80rpx;
  box-sizing: border-box;
  white-space: nowrap;
}

.milestone-icon {
  font-size: 28rpx;
  margin-bottom: 4rpx;
  filter: grayscale(100%);
  transition: filter 0.3s ease;
}

.milestone.achieved .milestone-icon {
  filter: grayscale(0%);
  transform: scale(1.1);
}

.milestone.achieved .milestone-info {
  background: rgba(1, 156, 242, 0.1);
  border-color: #019cf2;
  box-shadow: 0 2rpx 12rpx rgba(1, 156, 242, 0.2);
}

.milestone-label {
  font-size: 22rpx;
  color: #333;
  font-weight: 600;
  margin-right: 4rpx;
  line-height: 1.2;
  transition: color 0.3s ease;
}

.milestone.achieved .milestone-label {
  color: #019cf2;
  font-weight: 700;
}

.milestone-amount {
  font-size: 20rpx;
  color: #ef7721;
  font-weight: 700;
  line-height: 1.2;
  transition: color 0.3s ease;
}

.milestone.achieved .milestone-amount {
  color: #019cf2;
  font-weight: 800;
}

.next-target {
  text-align: center;
  padding: 12rpx;
  margin-bottom: 10rpx;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 12rpx;
  border: 1rpx solid rgba(239, 119, 33, 0.1);
}

.next-text {
  font-size: 26rpx;
  color: #ef7721;
  font-weight: 600;
}

.cart-button {
  background: linear-gradient(135deg, #ef7721 0%, #ff8a3d 100%);
  border: none;
  border-radius: 20rpx;
  padding: 12rpx 16rpx;
  display: flex;
  align-items: center;
  gap: 6rpx;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2rpx 8rpx rgba(239, 119, 33, 0.3);
  cursor: pointer;
  flex-shrink: 0;
}

.cart-button:active {
  transform: scale(0.96);
  box-shadow: 0 2rpx 12rpx rgba(239, 119, 33, 0.5);
}

.cart-icon {
  font-size: 24rpx;
}

.cart-text {
  color: #ffffff;
  font-size: 24rpx;
  font-weight: 600;
  white-space: nowrap;
}

.cart-count {
  background: rgba(255, 255, 255, 0.25);
  color: #ffffff;
  border-radius: 50%;
  width: 44rpx;
  height: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  font-weight: 700;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

/* 响应式设计 */
@media screen and (max-width: 750rpx) {
  .products-grid {
    grid-template-columns: 1fr;
  }

  .product-card {
    max-width: 100%;
  }
}

/* 购物车弹窗样式 */
.cart-dialog {
  border-radius: 24rpx !important;
}

.cart-dialog .el-dialog {
  border-radius: 24rpx;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
  max-height: 80vh !important;
  display: flex;
  flex-direction: column;
}

/* 尺码颜色选择弹窗样式 */
.size-color-dialog .el-dialog {
  border-radius: 24rpx;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
  max-height: 80vh !important;
}

.size-color-dialog .el-dialog__header {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  color: #1d1d1f;
  padding: 32rpx;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 24rpx 24rpx 0 0;
}

.size-color-dialog .el-dialog__title {
  color: #1d1d1f;
  font-size: 32rpx;
  font-weight: 700;
  letter-spacing: 1rpx;
}

.size-color-dialog .el-dialog__body {
  padding: 40rpx;
  background: transparent;
  max-height: 60vh;
  overflow-y: auto;
}

.size-color-content {
  display: flex;
  flex-direction: column;
  gap: 40rpx;
}

.size-color-content .product-info {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 10rpx;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 16rpx;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.size-color-content .product-image {
  width: 120rpx;
  height: 120rpx;
  border-radius: 12rpx;
  flex-shrink: 0;
  object-fit: cover;
}

.size-color-content .product-details {
  flex: 1;
}

.size-color-content .product-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 12rpx;
  line-height: 1.4;
}

.size-color-content .product-price {
  font-size: 36rpx;
  font-weight: 700;
  color: #ef7721;
}

.spec-section {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.spec-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1d1d1f;
}

.spec-options {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.spec-option {
  padding: 10rpx 20rpx;
  border: 2rpx solid rgba(142, 142, 147, 0.3);
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #1d1d1f;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 80rpx;
  text-align: center;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.spec-option:hover {
  border-color: #ef7721;
  color: #ef7721;
  transform: scale(1.02);
}

.spec-option.selected {
  border-color: #ef7721;
  background: #ef7721;
  color: white;
  box-shadow: 0 4rpx 16rpx rgba(239, 119, 33, 0.4);
}

.confirm-section {
  padding-top: 20rpx;
}

.confirm-button {
  width: 100%;
  height: 88rpx;
  font-size: 32rpx;
  font-weight: 600;
  background: linear-gradient(135deg, #ef7721 0%, #ff8a3d 100%);
  border: none;
  border-radius: 16rpx;
  color: white;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4rpx 20rpx rgba(239, 119, 33, 0.4);
}

.confirm-button:hover {
  transform: translateY(-2rpx);
  box-shadow: 0 6rpx 24rpx rgba(239, 119, 33, 0.5);
}

.confirm-button:active {
  transform: scale(0.98);
}

.confirm-button:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.cart-dialog .el-dialog__header {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  color: #1d1d1f;
  padding: 32rpx;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 24rpx 24rpx 0 0;
}

.cart-dialog .el-dialog__title {
  color: #1d1d1f;
  font-size: 32rpx;
  font-weight: 700;
  letter-spacing: 1rpx;
}

.cart-dialog .el-dialog__headerbtn {
  top: 32rpx;
  right: 32rpx;
}

.cart-dialog .el-dialog__close {
  color: rgba(255, 255, 255, 0.8);
  font-size: 36rpx;
  transition: all 0.3s ease;
}

.cart-dialog .el-dialog__close:hover {
  color: #ffffff;
}

.cart-dialog .el-dialog__body {
  padding: 0;
  background: transparent;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.cart-dialog .el-dialog__body::-webkit-scrollbar {
  width: 6rpx;
}

.cart-dialog .el-dialog__body::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 6rpx;
}

.cart-dialog .el-dialog__body::-webkit-scrollbar-thumb {
  background: rgba(239, 119, 33, 0.3);
  border-radius: 6rpx;
  transition: all 0.3s ease;
}

.cart-dialog .el-dialog__body::-webkit-scrollbar-thumb:hover {
  background: rgba(239, 119, 33, 0.5);
}

.cart-items::-webkit-scrollbar {
  width: 6rpx;
}

.cart-items::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 6rpx;
}

.cart-items::-webkit-scrollbar-thumb {
  background: rgba(239, 119, 33, 0.3);
  border-radius: 6rpx;
  transition: background 0.3s ease;
}

.cart-items::-webkit-scrollbar-thumb:hover {
  background: rgba(239, 119, 33, 0.5);
}

.cart-items {
  padding: 16rpx;
  margin-bottom: 20rpx;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 20rpx;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.empty-cart {
  text-align: center;
  padding: 80rpx 0;
  color: #8e8e93;
}

/* 滑动删除容器样式 */
.cart-item-wrapper {
  position: relative;
  margin-bottom: 16rpx;
  border-radius: 16rpx;
  overflow: hidden;
}

/* 删除背景样式 */
.delete-background {
  position: absolute;
  top: 0;
  right: 0;
  width: 150px;
  height: 100%;
  background: linear-gradient(135deg, #ff4757, #ff3838);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16rpx;
  transition: opacity 0.1s ease;
}

.delete-text {
  color: white;
  font-size: 28rpx;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.cart-item-container {
  position: relative;
  display: flex;
  align-items: center;
}

.cart-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 16rpx;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.15);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  width: 100%;
  min-width: 100%;
}

.cart-item:hover {
  transform: translateY(-2rpx);
  box-shadow: 0 6rpx 24rpx rgba(0, 0, 0, 0.12);
}

.cart-item:last-child {
  margin-bottom: 0;
}

.cart-item-info {
  display: flex;
  align-items: center;
  flex: 1;
}

.cart-item-image {
  width: 120rpx;
  height: 120rpx;
  border-radius: 16rpx;
  margin-right: 24rpx;
  object-fit: cover;
  background: #f5f5f7;
}

.cart-item-details {
  flex: 1;
}

.cart-item-name {
  font-size: 28rpx;
  color: #333333;
  font-weight: 600;
  margin-bottom: 8rpx;
  line-height: 1.4;
}

.cart-item-specs {
  font-size: 24rpx;
  color: #ef7721;
  margin-bottom: 6rpx;
  background: rgba(142, 142, 147, 0.12);
  padding: 4rpx 8rpx;
  border-radius: 8rpx;
  display: inline-block;
}

.cart-item-price {
  font-size: 26rpx;
  color: #666666;
  font-weight: 700;
}

.cart-total {
  margin-top: 32rpx;
  padding: 24rpx 20rpx;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 16rpx;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.15);
  text-align: right;
}

.cart-total span {
  font-size: 32rpx;
  font-weight: 700;
  color: #ef7721;
  letter-spacing: 0.5rpx;
}

/* 标题编辑区域样式 */
.cart-title-section {
  margin-bottom: 24rpx;
  padding: 20rpx;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 16rpx;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.title-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.title-text {
  font-size: 32rpx;
  font-weight: 700;
  color: #333333;
  flex: 1;
}

.edit-title-btn {
  background: rgba(239, 119, 33, 0.1);
  border: 1px solid rgba(239, 119, 33, 0.3);
  border-radius: 12rpx;
  padding: 8rpx 12rpx;
  font-size: 24rpx;
  color: #ef7721;
  cursor: pointer;
  transition: all 0.3s ease;
}

.edit-title-btn:hover {
  background: rgba(239, 119, 33, 0.2);
  transform: scale(1.05);
}

.title-edit {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.title-input {
  flex: 1;
  padding: 12rpx 16rpx;
  border: 2px solid #ef7721;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #333333;
  background: rgba(255, 255, 255, 0.9);
  outline: none;
  transition: all 0.3s ease;
}

.title-input:focus {
  border-color: #ff8a3d;
  box-shadow: 0 0 0 4rpx rgba(239, 119, 33, 0.1);
}

.save-title-btn {
  background: #ef7721;
  border: none;
  border-radius: 12rpx;
  padding: 12rpx 16rpx;
  font-size: 24rpx;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
}

.save-title-btn:hover {
  background: #ff8a3d;
  transform: scale(1.05);
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 赠品区域样式 */
.gift-section {
  margin-top: 20rpx;
  padding: 20rpx 5rpx;
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
  border-radius: 16rpx;
}

.gift-title {
  font-size: 28rpx;
  font-weight: 700;
  color: #ef7721;
  margin-bottom: 16rpx;
}

.gift-items {
  display: flex;
  font-size: 24rpx;
  align-items: center;
  flex-direction: row;
  gap: 6rpx;
  flex-wrap: nowrap;
  overflow-x: auto;
  white-space: nowrap;
}

.gift-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 12rpx;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12rpx;
  border: 1px solid rgba(239, 119, 33, 0.2);
  flex: 0 0 auto;
}

.gift-icon {
  font-size: 32rpx;
}

.gift-name {
  font-size: 26rpx;
  color: #333333;
  font-weight: 600;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(100%);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(100%);
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 0;
  background: transparent;
}

/* 页面过渡动画 */
.page-enter-active,
.page-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-enter-from {
  opacity: 0;
  transform: translateY(20rpx);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-20rpx);
}


</style>
