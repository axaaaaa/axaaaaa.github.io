// Vue CLI 将此值固化进构建产物；部署静态文件后不会随访问日期变化。
process.env.VUE_APP_BUILD_TIME = new Date().toISOString()

const { defineConfig } = require('@vue/cli-service')
const CompressionPlugin = require('compression-webpack-plugin')  // Gzip 压缩插件

module.exports = defineConfig({
  transpileDependencies: true,
  
  // 生产环境关闭 source map，减少打包体积
  productionSourceMap: false,
  
  // 链式配置
  chainWebpack: (config) => {
    config.plugin('define').tap((definitions) => {
      Object.assign(definitions[0], {
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false'
      })
      return definitions
    })
  },
  
  // Webpack 配置
  configureWebpack: {
    // 生产环境插件
    plugins: [
      // Gzip 压缩
      new CompressionPlugin({
        algorithm: 'gzip',
        test: /\.(js|css|html|svg)$/,
        threshold: 10240,  // 10KB 以上才压缩
        minRatio: 0.8,     // 压缩比小于 0.8 才保留
        deleteOriginalAssets: false  // 保留原文件
      })
    ],
    
    // 代码分割优化
    optimization: {
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          // 第三方库单独打包
          vendor: {
            name: 'vendor',
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
            chunks: 'initial'
          },
          // Element Plus 单独打包
          elementPlus: {
            name: 'element-plus',
            test: /[\\/]node_modules[\\/]element-plus[\\/]/,
            priority: 20
          },
          // 公共代码提取
          common: {
            name: 'common',
            minChunks: 2,
            priority: 5,
            reuseExistingChunk: true
          }
        }
      }
    },
    
    // 性能提示配置
    performance: {
      hints: 'warning',
      maxAssetSize: 512000,      // 单个资源体积上限 500KB
      maxEntrypointSize: 512000  // 入口资源体积上限 500KB
    }
  }
})
