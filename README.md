# srTool - 购物助手应用

为实现在stayreal park线下购物凑单而开发的购物助手应用，支持商品浏览、分类筛选、搜索和购买功能。

## 功能特性

- **商品展示**: 精美的商品卡片展示，支持图片预览
- **分类筛选**: 按商品分类快速筛选商品
- **智能搜索**: 支持商品名称、分类、关键词搜索
- **购物车功能**: 商品选择和价格计算


## 📱 应用特性

- **跨平台支持**: 支持 H5、微信小程序、支付宝小程序、App 等多个平台
- **商品展示**: 精美的商品卡片展示，支持图片预览
- **分类筛选**: 按商品分类快速筛选商品
- **智能搜索**: 支持商品名称、分类、关键词搜索
- **响应式设计**: 适配不同屏幕尺寸

## 🛠 技术栈

- **框架**: uni-app 3.x
- **语言**: TypeScript + Vue 3
- **UI组件**: Element Plus
- **构建工具**: Vite
- **样式**: SCSS

## 📦 项目结构

```
srTool/
├── src/
│   ├── App.vue                 # 应用入口组件
│   ├── main.ts                 # 应用入口文件
│   ├── manifest.json           # 应用配置文件
│   ├── pages.json              # 页面路由配置
│   ├── pages/
│   │   └── coupon/
│   │       └── index.vue       # 主页面（商品列表）
│   ├── static/
│   │   ├── imgs/               # 图片资源
│   │   ├── logo.png            # 应用图标
│   │   └── products.json       # 商品数据
│   ├── common/
│   │   └── style/              # 公共样式
│   └── utils/
│       └── base.ts             # 工具函数
├── package.json                # 项目依赖配置
├── tsconfig.json               # TypeScript 配置
└── vite.config.ts              # Vite 构建配置
```

## 🚀 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm 或 yarn
- HBuilderX（推荐）或其他支持 uni-app 的开发工具

### 安装依赖

```bash
npm install
```

### 开发运行

```bash
# H5 开发
npm run dev:h5

# 微信小程序开发
npm run dev:mp-weixin

# 支付宝小程序开发
npm run dev:mp-alipay

# App 开发
npm run dev:custom
```

### 构建打包

```bash
# H5 构建
npm run build:h5

# 微信小程序构建
npm run build:mp-weixin

# 支付宝小程序构建
npm run build:mp-alipay

# App 构建
npm run build:custom
```

## 📱 功能说明

### 主要功能

1. **商品浏览**
   - 网格布局展示商品
   - 商品图片、名称、价格、分类信息
   - 支持商品选择和取消选择

2. **分类筛选**
   - 顶部分类标签切换
   - 支持"全部"、"新品"等分类
   - 实时筛选商品列表

3. **搜索功能**
   - 实时搜索商品名称
   - 支持关键词模糊匹配
   - 搜索结果高亮显示

4. **购物车**
   - 商品选择状态管理
   - 实时计算总价
   - 购买数量统计

### 数据结构

商品数据格式：
```json
{
  "id": 1,
  "name": "商品名称",
  "price": 399,
  "category": "分类",
  "size_color": "规格信息",
  "image": "/static/imgs/1.png",
  "sizes": ["S", "M", "L", "XL"],
  "colors": ["黑色", "白色"]
}
```

## 🎨 界面设计

- **主色调**: 现代简约风格
- **布局**: 响应式网格布局
- **交互**: 流畅的动画效果
- **适配**: 多端一致的用户体验

## 📄 开发说明

### 自定义配置

1. **修改应用信息**
   - 编辑 `src/manifest.json` 中的应用名称、描述等信息
   - 替换 `src/static/logo.png` 应用图标

2. **添加商品数据**
   - 编辑 `src/static/products.json` 添加商品信息
   - 将商品图片放置在 `src/static/imgs/` 目录下

3. **样式定制**
   - 修改 `src/uni.scss` 全局样式变量
   - 在各组件中自定义样式

### 部署说明

- **H5部署**: 构建后将 `dist/build/h5` 目录部署到 Web 服务器
- **小程序发布**: 使用对应平台的开发者工具导入构建产物
- **App打包**: 使用 HBuilderX 或云打包服务生成安装包

## 📝 更新日志

### v1.0.0
- 初始版本发布
- 基础商品展示功能
- 分类筛选和搜索功能
- 购物车基础功能

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📞 联系方式

如有问题或建议，请通过以下方式联系：

- 提交 Issue
- 发送邮件
- 微信群讨论

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

---

**注意**: 本项目仅供学习和参考使用，商业使用请确保遵循相关法律法规。