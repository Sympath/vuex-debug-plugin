import Vue from 'vue'
import Vuex from 'vuex'
import vuexDebugPluginFn from 'vuex-debug-plugin';
import sourceMap from './vuexDebugMap.config.js';
let vuexDebugPlugin = vuexDebugPluginFn({
  isDev(location){   // 默认为false 不传插件会直接不加载
      let localIdentifyings = ['8082','8080','test'];
      let isDev = localIdentifyings.some(id => location.href.indexOf(id) !== -1)
      return isDev
  },
  Vue,
  sourceMap,
  hasElementUI: true  // 项目是否接入了elementUi 
})
Vue.use(Vuex)
export default new Vuex.Store({
  plugins: [
    // logger({
    //   collapsed: true
    // }),
    vuexDebugPlugin()
  ]
})
