<template>
  <view 
    class="product-card"
    :class="{
      'product-card--horizontal': layout === 'horizontal',
      'product-card--vertical': layout === 'vertical',
      'product-card--loading': loading
    }"
    @click="handleClick"
  >
    <!-- 图片区域 -->
    <view class="product-card__image-wrapper">
      <BaseImage
        :src="product.image"
        :width="imageSize.width"
        :height="imageSize.height"
        :border-radius="8"
        mode="aspectFit"
        object-fit="contain"
        :lazy-load="lazyLoad"
        class="product-card__image"
        @click="handleImageClick"
      />
      
      <!-- 标签 -->
      <view v-if="product.tags && product.tags.length" class="product-card__tags">
        <text 
          v-for="tag in product.tags.slice(0, 2)" 
          :key="tag"
          class="product-card__tag"
        >
          {{ tag }}
        </text>
      </view>
      
      <!-- 收藏按钮 -->
      <view 
        v-if="showFavorite"
        class="product-card__favorite"
        @click.stop="handleFavoriteClick"
      >
        <text class="product-card__favorite-icon">{{ isFavorite ? '♥' : '♡' }}</text>
      </view>
    </view>
    
    <!-- 内容区域 -->
    <view class="product-card__content">
      <!-- 标题 -->
      <text class="product-card__title" :class="{ 'text-ellipsis-2': layout === 'vertical' }">
        {{ product.name }}
      </text>
      
      <!-- 描述 -->
      <text 
        v-if="showDescription && product.description"
        class="product-card__description text-ellipsis-2"
      >
        {{ product.description }}
      </text>
      
      <!-- 规格信息 -->
      <view v-if="showSpecs && (product.sizes?.length || product.colors?.length)" class="product-card__specs">
        <text v-if="product.sizes?.length" class="product-card__spec">
          尺寸: {{ product.sizes.join(', ') }}
        </text>
        <text v-if="product.colors?.length" class="product-card__spec">
          颜色: {{ product.colors.join(', ') }}
        </text>
      </view>
      
      <!-- 价格区域 -->
      <view class="product-card__price-wrapper">
        <text class="product-card__price">{{ formatPrice(product.price) }}</text>
        <text 
          v-if="product.originalPrice && product.originalPrice > product.price"
          class="product-card__original-price"
        >
          {{ formatPrice(product.originalPrice) }}
        </text>
        <text 
          v-if="product.originalPrice && product.originalPrice > product.price"
          class="product-card__discount"
        >
          {{ Math.round((1 - product.price / product.originalPrice) * 100) }}% OFF
        </text>
      </view>
      
      <!-- 评分和销量 -->
      <view v-if="showRating || showSales" class="product-card__meta">
        <view v-if="showRating && product.rating" class="product-card__rating">
          <text class="product-card__rating-stars">{{ '★'.repeat(Math.floor(product.rating)) }}</text>
          <text class="product-card__rating-text">{{ product.rating }}</text>
        </view>
        <text v-if="showSales && product.sales" class="product-card__sales">
          已售 {{ product.sales }}
        </text>
      </view>
    </view>
    
    <!-- 数量控制按钮 -->
    <view v-if="showQuantityControl" class="product-card__quantity-control">
      <button 
        class="product-card__quantity-btn product-card__quantity-btn--remove"
        @click.stop="handleAddRemoveClick"
        :class="{ 'product-card__quantity-btn--selected': isSelected }"
      >
        {{ isSelected ? '-' : '+' }}
      </button>
    </view>
    
    <!-- 操作按钮 -->
    <view v-if="showActions" class="product-card__actions">
      <button 
        class="product-card__action-btn product-card__action-btn--cart"
        @click.stop="handleAddToCart"
      >
        加入购物车
      </button>
      <button 
        class="product-card__action-btn product-card__action-btn--buy"
        @click.stop="handleBuyNow"
      >
        立即购买
      </button>
    </view>
    
    <!-- 加载状态 -->
    <view v-if="loading" class="product-card__loading">
      <text class="product-card__loading-text">加载中...</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { Product } from '@/types/product';
import { formatPrice } from '@/utils/base';
import BaseImage from './BaseImage.vue';

interface Props {
  product: Product;
  layout?: 'vertical' | 'horizontal';
  imageSize?: { width: number; height: number };
  showDescription?: boolean;
  showSpecs?: boolean;
  showRating?: boolean;
  showSales?: boolean;
  showActions?: boolean;
  showFavorite?: boolean;
  lazyLoad?: boolean;
  loading?: boolean;
  isSelected?: boolean;
  showQuantityControl?: boolean;
}

interface Emits {
  click: [product: Product];
  imageClick: [product: Product];
  addToCart: [product: Product];
  buyNow: [product: Product];
  favoriteChange: [product: Product, isFavorite: boolean];
  'add-remove': [productId: string];
}

const props = withDefaults(defineProps<Props>(), {
  layout: 'vertical',
  imageSize: () => ({ width: 140, height: 140 }),
  showDescription: false,
  showSpecs: false,
  showRating: true,
  showSales: true,
  showActions: false,
  showFavorite: false,
  lazyLoad: true,
  loading: false,
  isSelected: false,
  showQuantityControl: false,
});

const emit = defineEmits<Emits>();

// 收藏状态
const isFavorite = ref(false);

// 事件处理
const handleClick = () => {
  if (props.loading) return;
  emit('click', props.product);
};

const handleImageClick = () => {
  if (props.loading) return;
  emit('imageClick', props.product);
};

const handleAddToCart = () => {
  if (props.loading) return;
  emit('addToCart', props.product);
};

const handleBuyNow = () => {
  if (props.loading) return;
  emit('buyNow', props.product);
};

const handleFavoriteClick = () => {
  if (props.loading) return;
  isFavorite.value = !isFavorite.value;
  emit('favoriteChange', props.product, isFavorite.value);
};

const handleAddRemoveClick = () => {
  if (props.loading) return;
  emit('add-remove', props.product.id);
};
</script>

<style lang="scss" scoped>
.product-card {
  position: relative;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.98);
  }
  
  &--loading {
    opacity: 0.6;
    pointer-events: none;
  }
  
  &--vertical {
    display: flex;
    flex-direction: column;
  }
  
  &--horizontal {
    display: flex;
    flex-direction: row;
    
    .product-card__image-wrapper {
      flex-shrink: 0;
      width: 100px;
      height: 100px;
    }
    
    .product-card__content {
      flex: 1;
      padding: 12px;
    }
  }
}

.product-card__image-wrapper {
  position: relative;
  width: 100%;
  height: 130px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.product-card__image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  object-position: center;
}

.product-card__tags {
  position: absolute;
  top: 8px;
  left: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.product-card__tag {
  padding: 2px 6px;
  background: rgba(255, 0, 0, 0.8);
  color: #fff;
  font-size: 10px;
  border-radius: 4px;
}

.product-card__favorite {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  backdrop-filter: blur(4px);
}

.product-card__favorite-icon {
  font-size: 16px;
  color: #ff4757;
}

.product-card__content {
  padding: 3px 6px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.product-card__title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  line-height: 1.4;
}

.product-card__description {
  font-size: 12px;
  color: #666;
  line-height: 1.4;
}

.product-card__specs {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.product-card__spec {
  font-size: 11px;
  color: #999;
}

.product-card__price-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.product-card__price {
  font-size: 16px;
  font-weight: 600;
  color: #ff4757;
}

.product-card__original-price {
  font-size: 12px;
  color: #999;
  text-decoration: line-through;
}

.product-card__discount {
  padding: 2px 4px;
  background: #ff4757;
  color: #fff;
  font-size: 10px;
  border-radius: 2px;
}

.product-card__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.product-card__rating {
  display: flex;
  align-items: center;
  gap: 4px;
}

.product-card__rating-stars {
  font-size: 12px;
  color: #ffa502;
}

.product-card__rating-text {
  font-size: 11px;
  color: #666;
}

.product-card__sales {
  font-size: 11px;
  color: #999;
}

.product-card__quantity-control {
  position: absolute;
  bottom: 8px;
  right: 8px;
  z-index: 2;
}

.product-card__quantity-btn {
  width: 28px;
  height: 28px;
  border: 1px solid #ff8c00;
  border-radius: 50%;
  background: #ff8c00;
  color: #fff;
  font-size: 16px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(255, 140, 0, 0.3);
  transition: all 0.2s ease;
  
  &--selected {
    background: #ff6347;
    color: #fff;
    border-color: #ff6347;
    box-shadow: 0 2px 4px rgba(255, 99, 71, 0.3);
  }
  
  &:active {
    transform: scale(0.95);
  }
}

.product-card__actions {
  padding: 8px 12px;
  display: flex;
  gap: 8px;
  border-top: 1px solid #f0f0f0;
}

.product-card__action-btn {
  flex: 1;
  height: 32px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  
  &--cart {
    background: #f0f0f0;
    color: #333;
  }
  
  &--buy {
    background: #ff4757;
    color: #fff;
  }
}

.product-card__loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(2px);
}

.product-card__loading-text {
  font-size: 12px;
  color: #999;
}

// 工具类
.text-ellipsis-2 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>