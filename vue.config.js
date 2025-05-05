const { defineConfig } = require('@vue/cli-service')
// webpack.config.js
const AutoImport = require('unplugin-auto-import/webpack')
const Components = require('unplugin-vue-components/webpack')
const { ElementPlusResolver } = require('unplugin-vue-components/resolvers')

module.exports = {
  transpileDependencies: true,
  configureWebpack: config =>{
    config.plugins.push(AutoImport({
      resolvers: [ElementPlusResolver()],
    }))
    config.plugins.push(Components({
      resolvers: [ElementPlusResolver()],
    }))
  },
  devServer: {
    allowedHosts: [
      // 允许连接的主机名或 IP 地址
      "all"
    ],
    port: 8888,
    // proxy:{
    //   '/api':{
    //     target:'http://127.0.0.1:8888',
    //     changeOrigin: true,
    //     ws: true,
    //     secure: true,
    //     pathRewrite:{
    //       '^/api': ''
    //     }
    //   }
    // }
  },
}