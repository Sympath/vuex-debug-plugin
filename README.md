# vuex-debug-plugin | vuex数据由何而来

### 面向问题
采用Vuex后MVC模式导致前端查询属性数据来源对应的接口麻烦的问题；尤其公共接口，不熟悉的同学要一遍遍找后端同学确定，很多无用功；

### 解决思路
- 主要面向两类数据
    - 页面特定接口 即业务接口 如列表的增删改查
    - 公共接口，接口请求出发mutation，交由vuex托管，页面通过`mapGetter`进行获取；

- 前者建议统一格式为直接调用service层，不交由vuex托管；
- 后者采用预先定义表（表属性如下），以type为映射主键，通过vuex的插件进行获取当前页使用了哪些数据，从而过滤查询

| type（commit时的type参数） | Getter（对应的属性） | API（接口地址） | 操作         | 备注 |
| -------------------------- | -------------------- | --------------- | ------------ | ---- |
|                            |                      |                 | 查看接口文档 |      |
|                            |                      |                 |              |      |
|                            |                      |                 |              |      |

### 使用
##### 安装
```
npm i vuex-debug-plugin -D
```
###### 引入
在store/index.js（就是`new Store`的地方），引入插件
```js
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
```
并在同级创建`vuexDebugMap.config.js`文件，其内容格式为
```js
let sourceMap = {
    // type为commit时传递的type
    'branchHospital/SET_HOSPITAl_SETTING_CONFIG':{
        getter: 'hospitalSettingConfig', // 其对应的getter
        api: '/user-auth/hospital/setting', // 其对应的接口地址
        apiDocsLink: 'https://www.baidu.com', // 其对应的接口文档地址
        annotation: '这是医院配置信息获取或设置的接口' // 备注信息
    }
}
export default sourceMap;
```
### 待优化

- 现在要进行预定义，暂时未想到如何直接动态生成
- 在新建时，如何借助后端`逆向工程`的思想，根据用户输入接口，动态生成VUEX的MVC三层代码，这样既节省开发时间，又可以统一命名等规范
- 渲染列采用外部传入的方式，支持用户自定义
- 渲染无elementUi状态下的插件面板
- 支持模块化的格式
- 支持模糊查询条件过滤（如：【备注】中含有【过滤】的数据才展示）