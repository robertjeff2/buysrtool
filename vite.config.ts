import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    uni(),
    // 注意：如需启用压缩和分析插件，请先安装对应依赖：
    // npm install --save-dev rollup-plugin-visualizer vite-plugin-compression
  ],
  
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  
  // 构建优化配置
  build: {
    // 启用/禁用 CSS 代码拆分
    cssCodeSplit: true,
    
    // 构建后是否生成 source map 文件
    sourcemap: process.env.NODE_ENV === 'development',
    
    // 设置最终构建的浏览器兼容目标
    target: 'es2015',
    
    // 启用/禁用 minification，或是指定使用哪种混淆器
    minify: 'terser',
    
    // 传递给 Terser 的更多 minify 选项
    terserOptions: {
      compress: {
        // 生产环境移除 console
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: true,
        pure_funcs: ['console.log'],
      },
      format: {
        // 删除注释
        comments: false,
      },
    },
    
    // 自定义底层的 Rollup 打包配置
    rollupOptions: {
      output: {
        // 分包策略（简化配置，避免依赖错误）
        manualChunks: (id) => {
          // 将 node_modules 中的依赖打包成 vendor chunk
          if (id.includes('node_modules')) {
            return 'vendor';
          }
          // 将工具函数打包成 utils chunk
          if (id.includes('/utils/')) {
            return 'utils';
          }
          // 将组件打包成 components chunk
          if (id.includes('/components/')) {
            return 'components';
          }
        },
        
        // 用于从入口点创建的块的打包输出格式
         chunkFileNames: (chunkInfo) => {
           const facadeModuleId = chunkInfo.facadeModuleId
             ? chunkInfo.facadeModuleId.split('/').pop()?.replace(/\.[^.]*$/, '') || 'chunk'
             : 'chunk';
           return `js/${facadeModuleId}-[hash].js`;
         },
         
         // 用于命名代码拆分时创建的共享块的输出命名
         assetFileNames: (assetInfo) => {
           const name = assetInfo.name || 'asset';
           const info = name.split('.');
           let extType = info[info.length - 1];
           
           if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/i.test(name)) {
             extType = 'media';
           } else if (/\.(png|jpe?g|gif|svg)(\?.*)?$/i.test(name)) {
             extType = 'images';
           } else if (/\.(woff2?|eot|ttf|otf)(\?.*)?$/i.test(name)) {
             extType = 'fonts';
           }
           
           return `${extType}/[name]-[hash][extname]`;
         },
      },
      
      // 外部化处理
      // external: [
      //   // 如果有需要外部化的依赖，在这里添加
      // ],
    },
    
    // chunk 大小警告的限制（以 kbs 为单位）
    chunkSizeWarningLimit: 1000,
    
    // 启用/禁用 brotli 压缩大小报告
    reportCompressedSize: false,
  },
  
  // 开发服务器配置
  server: {
    // 启用开发服务器的 HTTPS
    // https: true,
    
    // 指定开发服务器端口
    port: 5174,
    
    // 设为 true 时若端口已被占用则会直接退出
    strictPort: false,
    
    // 服务器启动时自动在浏览器中打开应用程序
    open: false,
    
    // 为开发服务器配置 CORS
     cors: true,
  },
  
  // 预构建配置
  optimizeDeps: {
    // 强制预构建链接的包（简化配置）
    include: [
      // 移除可能导致冲突的依赖
    ],
    
    // 在预构建中强制排除的依赖项
    exclude: [
      // 排除一些不需要预构建的包
    ],
  },
  
  // 静态资源处理
  assetsInclude: [
    // 添加自定义文件类型作为静态资源
    '**/*.md',
  ],
  
  // CSS 相关配置
  css: {
    // CSS 预处理器配置
    preprocessorOptions: {
      scss: {
        // 全局 SCSS 变量和混入
        additionalData: `@use "@/common/style/variables.scss" as *;`,
        // 使用现代 Sass API
        api: 'modern',
      },
    },
    
    // 配置 CSS modules
    modules: {
      // CSS modules 的配置
      localsConvention: 'camelCase',
    },
    
    // PostCSS 配置
    postcss: {
      plugins: [
        // 可以在这里添加 PostCSS 插件
      ],
    },
  },
  
  // 环境变量配置
  define: {
    // 定义全局常量替换
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
});
