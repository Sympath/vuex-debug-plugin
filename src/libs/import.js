import { callFn, deWeight, eachObj, getApiByService, getStateByType, getVal, mergeArr, nextTick, nextTickForImmediately, nextTickForSetTime, reTry, setActive, tf, typeCheck } from "../../util";
import { genInput } from "../../util/eleUtil";
import cachePlugin from "../plugins/cachePlugin";
import cacheApplyPlugin from "../plugins/cacheServicePlugin";
// import dragPlugin from "../plugins/dragPlugin";
import moduleHandlerPlugin from "../plugins/moduleHandlerPlugin";
import searchPlugin from "../plugins/searchPlugin";
import searchServicePlugin from "../plugins/searchServicePlugin";


export let data = {
  firstInited: false, // 初次渲染已完成
  h: ()=>{ console.log('未获取h函数');},
  errMsg: '组件列表为空，糟糕，大概出啥子问题了，快去提issue吧~', // 错误提示信息
  showPhanel: false,// 控制是否显示面板
  notFirstRenderChooseBtn: false,
  beforeDestroys: [], // 销毁时事件
  targetList: [], // 当前命中列表 用于渲染
  sourceList: [],// 数据源列表 用于缓存
  serviceList: [], // 存储项目service中方法和接口的对应关系
  serviceTargetList: [], // 存储项目service对应的渲染数据列表
  tableColumnsMap: {
    1: [
      {
        label: 'commit时的type参数',
        prop: 'showType',
        width: '200'
      },
      {
        label: 'Getter（对应的属性）',
        prop: 'getter',
        width: '200'
      },
      {
        label: 'Action',
        prop: 'action',
        width: '200'
      },
      {
        label: 'API（接口地址）',
        prop: 'api',
        width: '200'
      },
      {
        label: '备注信息',
        prop: 'annotation',
        width: '200',
          renderCell: (h, {row,column,$index}) => {
          return genInput(h,(val) => {
            // 在弹窗关闭时会判断 如果此属性为true 则会重置vuex数据缓存
            data.isChangeCache = true;
            row.annotation = val;
          }, `vuexAnnotation${$index}`, row.annotation)
      },
      },
      // {
      //   label: '操作',
      //   prop: 'api',
      //   width: '200',
      //   renderCell: (h, {row,column,$index}) => {
      //     return h('el-link',{
      //       props: {
      //         href: row.apiDocsLink,
      //         // icon: 'el-icon-view',
      //         underline: false
      //       },
      //       attrs: {
      //         target: "_blank"
      //       }
      //     },'查看接口文档')
      //   }
      // },
    ],
    2: [
        {
          label: '模块',
          prop: 'moduleName',
          width: '200'
        },
        {
          label: '方法名',
          prop: 'serviceName',
          width: '200'
        },
        {
          label: 'API（接口地址）',
          prop: 'api',
          width: '200'
        },
        {
          label: '备注信息',
          prop: 'annotation',
          width: '200',
          renderCell: (h, {row,column,$index}) => {
            return genInput(h,(val) => {
              // 在弹窗关闭时会判断 如果此属性为true 则会重置vuex数据缓存
              // data.isChangeCache = true;
              row.annotation = val;
            }, `serviceAnnotation${$index}`, row.annotation)
           }
        },
         {
        label: '操作',
        prop: 'api',
        width: '200',
        renderCell: (h, {row,column,$index}) => {
          return h('el-link',{
            props: {
              href: row.apiDocsLink,
              // icon: 'el-icon-view',
              underline: false
            },
            attrs: {
              target: "_blank"
            }
          },'查看接口文档')
        }
      },
    ]
  },
  tableType: 1,
  pluginMap: {
    dataPlugins: [], // 数据插件 会在当前渲染列表新增数据时执行
    layoutPlugins: [], // 布局插件，会渲染返回的dom
  } , // 实现插件机制
  options: {}, // ignoreModules  不需要处理模块
}
let h; // 用于存储$createElement函数
window._vuexData = data;
// 装载插件 入口函数 main
function importPlugin(Vue,_options){  
  data.options = _options;
  h = data.h;
  eachObj(data.options, (key, val) => {
    Object.defineProperty(data, key, {
      get(){
        return data.options[key]
      },
      set(newVal){
        data.options[key] = newVal;
      }
    })
  })
  initService(data.serviceMap);
  addPlugin('cache-apply-plugin',cacheApplyPlugin)
  addPlugin('module-handler-plugin',moduleHandlerPlugin)
  addPlugin('cache-plugin',cachePlugin)
  addPlugin('search-service-plugin',searchServicePlugin)
  addPlugin('search-plugin',searchPlugin)
  // addPlugin(dragPlugin)
  observe();
  let vuexDebugPluginMixin = {
    beforeRouteEnter (to, from, next) {
      next(function (vm) {
        if(vm._uid) data.h = vm.$createElement
        // 包裹一层 从而只执行一遍
        nextTickForImmediately(
          function initEnter() {
            
          }
        )
      });
    },
    beforeRouteLeave(to, from, next){
      // 包裹一层 从而只执行一遍
      nextTickForImmediately(
        function iniLeave() {
          // 置空当前数据 但不能改变地址值指向 不然会导致observe方法的切片失败导致插件机制失败
          data.targetList.length = 0;
        }
      )
      next()
    },
    beforeDestroy(){
     
    }
  }
  Vue.mixin(vuexDebugPluginMixin)
}
Object.defineProperty(data, 'tableColumns', {
  get(){
    return data.tableColumnsMap[data.tableType];
  }
})

/**
 * 不需要处理的type
 * @param {*} moduleName type对应的模块
 * @param {*} type type名称
 */
export function noNeedResolve(moduleName, type, module) {
  // let noNeedResolve = false; // 默认需要处理
  // 判断下是不是用户决定不需要处理的模块
  let {ignoreModules = []} = data.options;
  if(ignoreModules.includes(moduleName)){
    return true;
  }
  
  let hased = data.targetList.some(item=>{
    if((item.moduleName === moduleName ) && item.type === type){
        return true 
    } 
  })
//  如果已经有了则不要再存了
  if (hased) {
    return true;
  }
  
  
}

function initService(serviceMap) {
  let vuexPluginServiceData = JSON.parse(localStorage.getItem('vuexPluginServiceData')) || [];
  data.isChangeServiceCache = false;
  // 关闭时校验，如果启动了更新机制，则重置缓存数据
  data.beforeDestroys.push((data)=> {
    if(data.isChangeServiceCache){
      localStorage.setItem('vuexPluginServiceData', JSON.stringify(data.serviceList))
    }
  })
  // // 如果开启缓存的话，则走缓存数据
  if(vuexPluginServiceData.length > 0){
    data.serviceList = vuexPluginServiceData;
    return
  }
  // 没缓存进行解析
  eachObj(serviceMap, (moduleName, moduleServiceObj) => {
    eachObj(moduleServiceObj, (serviceName , serviceFn) => {
      let [ _ , api] = getApiByService(serviceMap[moduleName],serviceName).replace(/\s/g, '').split('|');
      data.serviceList.push({
        serviceName,
        api,
        moduleName
      })
    })
  })
  localStorage.setItem('vuexPluginServiceData', JSON.stringify(data.serviceList))
  
}

function observe() {
  let oldArrayProtoMethods = Array.prototype;
  // 进行一层方法劫持 在新数据增加时进行缓存在localstorage的操作
  data.targetList.push = function (newObj){
    if (!typeCheck('Array')(data.pluginMap.dataPlugins)) {
      console.error(`data.pluginMap.dataPlugins不是数组`);
      data.pluginMap.dataPlugins = []
    }
    let noNeedPlush = false;
    let index = -1;
    dispatch(0)
    function dispatch(i) {
      let fn = null;
      if(i <= index) Promise.resolve(new Error('next() called multiple times'));
      fn = data.pluginMap.dataPlugins[i];
      if(i === data.pluginMap.dataPlugins.length) fn = ()=> {console.log('所有插件执行完毕');return true};
      // debugger
      let pluginReturn = fn(dispatch.bind(null, i + 1), newObj);
      if(pluginReturn){
        noNeedPlush = true;
      }
    }
    // 如果有一个插件决定不push 则不再push
    if(!noNeedPlush){
      let r = oldArrayProtoMethods.push.apply(this,[newObj])
    }
  };
}
/**
 * 插件机制
 * @param {*} pluginWrap 插件默认为一个返回函数的函数 外层函数会默认执行 并在执行时被传递data；
 */
function addPlugin(pluginName,pluginWrap =() => {}) {
  if (typeCheck('Function')(pluginWrap)) {
    let plugin = pluginWrap(data);
    if (typeCheck('Function')(plugin)) {
      data.pluginMap.dataPlugins.push(plugin);
      // 记录插件名称
      data.pluginMap[pluginName] = {
        type: 0,
        plugin
      }
    }else if (typeCheck('Object')(plugin) && plugin.type === '1') {
      if (typeCheck('Function')(plugin.handler)) {
        data.pluginMap.layoutPlugins.push(plugin.handler)
        data.pluginMap[pluginName] = {
          type: 1,
          plugin: plugin.handler
        }
      }
   
    }else {
      console.error('未支持的插件类型');
    }
  }
}

export function mapCache(moduleName,type) {
  let cacheItems = data.sourceList.filter(item=>{
    if((item.moduleName === moduleName ) && item.type === type){
        return true 
    } 
  })
//  如果命中缓存 则直接返回缓存数据
  if (cacheItems.length > 0) {
    return cacheItems;
  }
}
export default importPlugin