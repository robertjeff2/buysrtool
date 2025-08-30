// 产品状态管理
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Product, Category, ProductFilter } from '@/types/product';

export const useProductStore = defineStore(
  'product',
  () => {
    // 状态
    const products = ref<Product[]>([]);
    const categories = ref<Category[]>([]);
    const currentCategory = ref<string>('all');
    const searchKeyword = ref<string>('');
    const filter = ref<ProductFilter>({
      category: 'all',
      priceRange: [0, 10000],
      sortBy: 'default',
      inStock: true,
    });
    const loading = ref(false);
    const error = ref<string>('');
    const page = ref(1);
    const pageSize = ref(20);
    const total = ref(0);
    const hasMore = ref(true);

    // 计算属性
    const filteredProducts = computed(() => {
      let result = products.value;

      // 分类筛选
      if (filter.value.category && filter.value.category !== 'all') {
        result = result.filter(product => product.category === filter.value.category);
      }

      // 搜索关键词筛选
      if (searchKeyword.value) {
        const keyword = searchKeyword.value.toLowerCase();
        result = result.filter(product => 
          product.name.toLowerCase().includes(keyword) ||
          (product.description && product.description.toLowerCase().includes(keyword))
        );
      }

      // 价格范围筛选
      if (filter.value.priceRange) {
        const [minPrice, maxPrice] = filter.value.priceRange;
        result = result.filter(product => 
          product.price >= minPrice && product.price <= maxPrice
        );
      }

      // 库存筛选
      if (filter.value.inStock) {
        result = result.filter(product => (product.stock || 0) > 0);
      }

      // 排序
      switch (filter.value.sortBy) {
        case 'price-asc':
          result.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          result.sort((a, b) => b.price - a.price);
          break;
        case 'sales':
          result.sort((a, b) => (b.sales || 0) - (a.sales || 0));
          break;
        case 'rating':
          result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
        case 'newest':
          result.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
          break;
        default:
          // 默认排序
          break;
      }

      return result;
    });

    const productsByCategory = computed(() => {
      const result: Record<string, Product[]> = {};
      
      categories.value.forEach(category => {
        result[category.value] = products.value.filter(product => product.category === category.value);
      });
      
      return result;
    });

    const popularProducts = computed(() => {
      return products.value
        .filter(product => (product.sales || 0) > 0)
        .sort((a, b) => (b.sales || 0) - (a.sales || 0))
        .slice(0, 10);
    });

    const recommendedProducts = computed(() => {
      return products.value
        .filter(product => (product.rating || 0) >= 4.0)
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 10);
    });

    // 方法
    const setProducts = (newProducts: Product[]) => {
      products.value = newProducts;
    };

    const addProducts = (newProducts: Product[]) => {
      products.value.push(...newProducts);
    };

    const setCategories = (newCategories: Category[]) => {
      categories.value = newCategories;
    };

    const setCurrentCategory = (categoryId: string) => {
      currentCategory.value = categoryId;
      filter.value.category = categoryId;
    };

    const setSearchKeyword = (keyword: string) => {
      searchKeyword.value = keyword;
    };

    const setFilter = (newFilter: Partial<ProductFilter>) => {
      filter.value = { ...filter.value, ...newFilter };
    };

    const resetFilter = () => {
      filter.value = {
        category: 'all',
        priceRange: [0, 10000],
        sortBy: 'default',
        inStock: true,
      };
      searchKeyword.value = '';
      currentCategory.value = 'all';
    };

    // 加载产品数据
    const loadProducts = async (refresh = false) => {
      if (loading.value) return;
      
      try {
        loading.value = true;
        error.value = '';
        
        if (refresh) {
          page.value = 1;
          products.value = [];
        }
        
        const response = await mockLoadProducts({
          page: page.value,
          pageSize: pageSize.value,
          category: filter.value.category,
          keyword: searchKeyword.value,
        });
        
        if (response.success && response.data) {
          if (refresh) {
            setProducts(response.data.products);
          } else {
            addProducts(response.data.products);
          }
          
          total.value = response.data.total;
          hasMore.value = products.value.length < total.value;
          
          if (!refresh) {
            page.value++;
          }
        }
      } catch (err) {
        error.value = err instanceof Error ? err.message : '加载失败';
      } finally {
        loading.value = false;
      }
    };

    // 加载分类数据
    const loadCategories = async () => {
      try {
        const response = await mockLoadCategories();
        
        if (response.success && response.data) {
          setCategories(response.data);
        }
      } catch (err) {
        console.error('加载分类失败:', err);
      }
    };

    // 根据ID获取产品
    const getProductById = (id: string): Product | undefined => {
      return products.value.find(product => product.id === id);
    };

    // 搜索产品
    const searchProducts = async (keyword: string) => {
      setSearchKeyword(keyword);
      await loadProducts(true);
    };

    // 获取相关产品
    const getRelatedProducts = (productId: string, limit = 6): Product[] => {
      const product = getProductById(productId);
      if (!product) return [];
      
      return products.value
        .filter(p => p.id !== productId && p.category === product.category)
        .slice(0, limit);
    };

    // 初始化
    const init = async () => {
      await Promise.all([
        loadCategories(),
        loadProducts(true),
      ]);
    };

    return {
      // 状态
      products,
      categories,
      currentCategory,
      searchKeyword,
      filter,
      loading,
      error,
      page,
      pageSize,
      total,
      hasMore,
      
      // 计算属性
      filteredProducts,
      productsByCategory,
      popularProducts,
      recommendedProducts,
      
      // 方法
      setProducts,
      addProducts,
      setCategories,
      setCurrentCategory,
      setSearchKeyword,
      setFilter,
      resetFilter,
      loadProducts,
      loadCategories,
      getProductById,
      searchProducts,
      getRelatedProducts,
      init,
    };
  },
  {
    persist: {
      key: 'product-store',
      paths: ['currentCategory', 'filter'],
    },
  }
);

// 模拟 API 函数
const mockLoadProducts = async (params: {
  page: number;
  pageSize: number;
  category?: string;
  keyword?: string;
}) => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 加载静态数据
  try {
    const response = await fetch('/static/products.json');
    const data = await response.json();
    
    let products = data.products || [];
    
    // 筛选
    if (params.category && params.category !== 'all') {
      products = products.filter((p: Product) => p.category === params.category);
    }
    
    if (params.keyword) {
      const keyword = params.keyword.toLowerCase();
      products = products.filter((p: Product) => 
        p.name.toLowerCase().includes(keyword)
      );
    }
    
    // 分页
    const start = (params.page - 1) * params.pageSize;
    const end = start + params.pageSize;
    const pageProducts = products.slice(start, end);
    
    return {
      success: true,
      data: {
        products: pageProducts,
        total: products.length,
        page: params.page,
        pageSize: params.pageSize,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: '加载产品数据失败',
    };
  }
};

const mockLoadCategories = async () => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return {
    success: true,
    data: [
      { id: 'all', name: '全部', icon: '' },
      { id: 'electronics', name: '数码电子', icon: '📱' },
      { id: 'clothing', name: '服装鞋帽', icon: '👕' },
      { id: 'home', name: '家居用品', icon: '🏠' },
      { id: 'beauty', name: '美妆护肤', icon: '💄' },
      { id: 'sports', name: '运动户外', icon: '⚽' },
      { id: 'books', name: '图书文具', icon: '📚' },
      { id: 'food', name: '食品饮料', icon: '🍎' },
    ],
  };
};