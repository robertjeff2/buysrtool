// 产品相关的组合式函数
import { ref, computed, reactive } from 'vue';
import type { Product, Category, ProductFilter } from '@/types/product';
import type { LoadingState } from '@/types/common';

// 产品状态
interface ProductState {
  products: Product[];
  categories: Category[];
  currentCategory: string;
  searchKeyword: string;
  loading: LoadingState;
  error: string | null;
}

const productState = reactive<ProductState>({
  products: [],
  categories: [],
  currentCategory: '新品',
  searchKeyword: '',
  loading: 'idle',
  error: null,
});

// 存储搜索框初始位置
let searchSectionTop = 0;

// 产品组合式函数
export const useProducts = () => {
  // 加载产品数据
  const loadProducts = async () => {
    try {
      productState.loading = 'loading';
      productState.error = null;

      // API 失败时回退到静态文件
      const response = await uni.request({
        url: '/static/products.json',
        method: 'GET',
      });

      if (response.statusCode === 200 && response.data) {
        const data = response.data as { products: Product[] };
        productState.products = data.products || [];
      } else {
        throw new Error('静态文件加载失败');
      }

      // 提取分类信息
      const categorySet = new Set<string>([]);
      productState.products.forEach(product => {
        if (product.category) {
          categorySet.add(product.category);
        }
      });
      productState.categories = Array.from(categorySet).map(cat => ({
        id: cat,
        name: cat,
      }));

      productState.loading = 'success';
    } catch (error) {
      productState.loading = 'error';
      productState.error = error instanceof Error ? error.message : '未知错误';
    }
  };

  // 记录搜索框初始位置
  const recordSearchSectionPosition = () => {
    uni
      .createSelectorQuery()
      .select('.search-section')
      .boundingClientRect(rect => {
        if (rect && !Array.isArray(rect) && typeof rect.top === 'number') {
          searchSectionTop = rect.top - 20;
        }
      })
      .exec();
  };

  // 设置当前分类
  const setCategory = (category: string) => {
    productState.currentCategory = category;
    // 切换分类后滚动到搜索框初始位置
    uni.pageScrollTo({
      scrollTop: searchSectionTop || 120, // 使用记录的位置，如果没有则使用默认值
      duration: 300,
    });
  };

  // 设置搜索关键词
  const setSearchKeyword = (keyword: string) => {
    productState.searchKeyword = keyword;
  };

  // 清除搜索
  const clearSearch = () => {
    productState.searchKeyword = '';
  };

  // 过滤产品
  const filteredProducts = computed(() => {
    let filtered = productState.products;

    // 按分类过滤
    if (productState.currentCategory && productState.currentCategory !== '全部') {
      filtered = filtered.filter(product => product.category === productState.currentCategory);
    }

    // 按关键词搜索
    if (productState.searchKeyword) {
      const keyword = productState.searchKeyword.toLowerCase();
      filtered = filtered.filter(
        product =>
          product.name.toLowerCase().includes(keyword) ||
          product.category.toLowerCase().includes(keyword) ||
          product.size_color.toLowerCase().includes(keyword)
      );
    }

    return filtered;
  });

  // 根据ID获取产品
  const getProductById = (id: string): Product | undefined => {
    return productState.products.find(product => product.id === id);
  };

  // 获取相关产品（同分类）
  const getRelatedProducts = (productId: string, limit = 4): Product[] => {
    const product = getProductById(productId);
    if (!product) return [];

    return productState.products.filter(p => p.id !== productId && p.category === product.category).slice(0, limit);
  };

  // 搜索产品
  const searchProducts = (filter: ProductFilter): Product[] => {
    let results = productState.products;

    if (filter.category && filter.category !== '全部') {
      results = results.filter(product => product.category === filter.category);
    }

    if (filter.keyword) {
      const keyword = filter.keyword.toLowerCase();
      results = results.filter(
        product => product.name.toLowerCase().includes(keyword) || product.category.toLowerCase().includes(keyword)
      );
    }

    if (filter.priceRange) {
      const [min, max] = filter.priceRange;
      results = results.filter(product => product.price >= min && product.price <= max);
    }

    return results;
  };

  // 获取价格范围
  const getPriceRange = (): [number, number] => {
    if (productState.products.length === 0) return [0, 0];

    const prices = productState.products.map(p => p.price);
    return [Math.min(...prices), Math.max(...prices)];
  };

  return {
    // 状态
    products: computed(() => productState.products),
    categories: computed(() => productState.categories),
    currentCategory: computed(() => productState.currentCategory),
    searchKeyword: computed(() => productState.searchKeyword),
    loading: computed(() => productState.loading),
    error: computed(() => productState.error),
    filteredProducts,

    // 方法
    loadProducts,
    recordSearchSectionPosition,
    setCategory,
    setSearchKeyword,
    clearSearch,
    getProductById,
    getRelatedProducts,
    searchProducts,
    getPriceRange,
  };
};
