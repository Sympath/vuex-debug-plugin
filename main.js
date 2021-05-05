import vuexDebugPlugin from './src/vuexDebugPlugin';
import {callFn} from './util';

// 用户传过来的配置项
export default  function pluginWrapper(options) {
  // 是否是微应用，如果是子应用则暴露子应用的插件
  let {
    isDev
  } = options;
  // 如果是dev环境 才继续执行
  if(callFn(isDev,window.location)){
    return vuexDebugPlugin(options)
  }else {
    return ()=>{}
  }
  
}

