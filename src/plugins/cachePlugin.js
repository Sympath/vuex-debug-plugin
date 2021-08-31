// 实现插件从而实现缓存机制
export default function cachePlugin(data) {
    // 先看有没有缓存
    let localStorageDatas = getStoreVuexPluginData();
    data.sourceList.push(...localStorageDatas);
    data.isChangeCache = false;
    data.beforeDestroys.push((data) => {
      if(data.isChangeCache){
        setStoreVuexPluginData(data.sourceList)
      }
    })
    return function (next,newObj) {
      // 加上缓存标识
      if(newObj.isCache){

      }else {
        newObj.isCache = true;
        // 存入缓存对象中
        data.sourceList.push(newObj)
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
  