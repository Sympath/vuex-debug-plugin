export default function moduleHandlerPlugin(data) {
    data.dictionaryMap = {
      showType: '字典模块 | dictionary',
      type: '',
      moduleName: 'dictionary',
      getter: '',
      action: 'actionMultiDictionary',
      api: 'apiFetchMultiDictionary | /common/dict/items/multi-code',
      index: 0,
      annotation: ''
    };
    data.targetList.push(data.dictionaryMap)
    return (next,newObj)=>{
      let noPush = false;
      let {moduleName, type } = newObj;
      // 字典模块特殊处理
      if (moduleName === 'dictionary') {
        // 如果target
        // if(data.targetList.every(item.showType !== 'showType')){
        //   data.targetList.push(data.dictionaryMap)
        // }
        data.dictionaryMap.type += `${data.dictionaryMap.index} ${type};`
        data.dictionaryMap.annotation = `触发字典为：${data.dictionaryMap.type}`
        data.dictionaryMap.index++;
        // let states = getStateByType(type,module);
        // data.dictionaryMap.getter += `${data.dictionaryMap.index} ${states.join(',')};`
        noPush = true;
      }else {
        next()
      }
      return noPush
      
    }
  }
  