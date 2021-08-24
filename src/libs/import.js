import { callFn, deWeight, eachObj, getStateByType, getVal, nextTick, nextTickForImmediately, nextTickForSetTime, reTry, setActive, tf, typeCheck } from "../../util";


export let data = {
  firstInited: false, // 初次渲染已完成
  h: ()=>{ console.log('未获取h函数');},
  errMsg: '组件列表为空，糟糕，大概出啥子问题了，快去提issue吧~', // 错误提示信息
  showPhanel: false,// 控制是否显示面板
  notFirstRenderChooseBtn: false,
  isDev: /qa.*test/.test(location.host),
  service: {},
  targetList: [], // 当前命中列表 用于渲染
  sourceList: [],// 数据源列表 用于缓存
  plugins: [], // 实现插件机制
  options: {} // ignoreModules  不需要处理模块
}
window._vuexData = data;
// 装载插件 入口函数 main
function importPlugin(Vue,_options){  
  data.options = _options;
  data.service = data.options.service;
  observe();
  addPlugin(cachePlugin)
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
  // 字典模块特殊处理
  if(moduleName === 'dictionary'){
    if ( !data.dictionaryMap) {
      data.dictionaryMap = {
        showType: '字典模块 | dictionary',
        type: '',
        moduleName,
        getter: '',
        action: 'actionMultiDictionary',
        api: 'apiFetchMultiDictionary | /common/dict/items/multi-code',
        index: 0,
        annotation: ''
      };
      data.targetList.push(data.dictionaryMap)
    }
    data.dictionaryMap.type += `${data.dictionaryMap.index} ${type};`
    data.dictionaryMap.annotation = `触发字典为：${data.dictionaryMap.type}`
    data.dictionaryMap.index++;
    return true
    // let states = getStateByType(type,module);
    // data.dictionaryMap.getter += `${data.dictionaryMap.index} ${states.join(',')};`
  }
  
}

function observe() {
  let oldArrayProtoMethods = Array.prototype;
  // 进行一层方法劫持 在新数据增加时进行缓存在localstorage的操作
  data.targetList.push = function (...args){
    let r = oldArrayProtoMethods.push.apply(this,args)
    data.plugins.forEach(
      plugin => plugin(...args)
    )
  };
}
/**
 * 插件机制
 * @param {*} pluginWrap 插件默认为一个返回函数的函数 外层函数会默认执行 并在执行时被传递data；
 */
function addPlugin(pluginWrap =() => {}) {
  if (typeCheck('Function')(pluginWrap)) {
    let plugin = pluginWrap(data);
    if (typeCheck('Function')(plugin)) {
      data.plugins.push(plugin);
    }else {
      console.error('插件需返回一个函数');
    }
  }
}
// 实现插件从而实现缓存机制
function cachePlugin(data) {
  // 先看有没有缓存
  let localStorageDatas = getStoreVuexPluginData();
  data.sourceList.push(...localStorageDatas);
  return function (...args) {
    if(args[0].isCache){

    }else {
      // 加上缓存标识
      args.forEach(item=>{
        item.isCache = true;
      })
      // 存入缓存对象中
      data.sourceList.push(...args)
      setStoreVuexPluginData(data.sourceList)
    }
  }
}

export function setStoreVuexPluginData(datas = []) {
  localStorage.setItem('vuexPluginData',JSON.stringify(datas));
}
export function getStoreVuexPluginData() {
  return JSON.parse(localStorage.getItem('vuexPluginData')) || [];
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