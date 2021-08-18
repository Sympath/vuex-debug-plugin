/**
      * 深度去除对象中为空的参数  递归  避免传空时后台未考虑此逻辑而出错
      * obj  需清理的对象
      */
function delDeep(obj){
  eachObj(obj,(key, value) => {
    if(!value){
         delete obj[key]
    }else if(typeof element === 'object'){
         delDeep(element)
    }else {

    }
  })
}

/**
 * 遍历对象 直接获取key value  （不会遍历原型链  forin会）
 * @param {*} obj 被遍历对象
 * @param {*} cb 回调
 */
export function eachObj(obj,cb){
  if(typeCheck('Map')(obj)){
    for (let [key, value] of obj) {
      cb(key,value);
    }
  }else {
    for (const [key, value] of Object.entries(obj)) {
      cb(key,value);
    }
  }
}
/**
 * 类型判断函数 传递一个要判断的类型 会返回一个函数 传要判断的值 返回是否属于之前的类型
 * @param {*} type 是否是此类型
 * @returns 
 */
export function typeCheck(type) {
  let types = [
      'Array',
      'Object',
      'Number',
      'String',
      'Undefined',
      'Boolean',
      'Function',
      'Map'
  ];
  let map = {};
  types.forEach(type=>{
      map[type]  = function(target){
         return Object.prototype.toString.call(target)  == `[object ${type}]`;
      }
  })
  return map[type]
}
export function callFn(fn,...params){
    let target = fn;
	if(typeCheck('Function')(target)) target = fn(...params)
    return target
}
// 转驼峰 a-b =》 aB
export function tf(str){
  var re=/-(\w)/g;
  str=str.replace(re,function($0,$1){
    return $1.toUpperCase();
  });
  return str
};
// 链式获取值 例如compsInstance上取值 .$parent.$options.components.page
export function getVal(obj,str) {
  
  let keys = str.split('.')  
  while (keys && keys.length > 0) {
    let key = keys.shift();
    if(obj[key]){
      obj = obj[key];
    }else {
      return {
        err: true,
        errKey: key
      }
    }  
  }
  return {
    err: false,
    result: obj
  }
} 

export function compareObj(ori,target,deep) {
  let changeKeys = [];
  _compareObj(ori,target,'',deep)
  function _compareObj(ori,target,fatherKey = '',deep = 999) {
    if(deep == 0) return ;
    else deep--;
    eachObj(ori,(key,val)=>{
      let type = typeof val;
      // 前有后有
      if(target.hasOwnProperty(key)){
        // 类型不一致 key改变了
        if(typeof target[key] === type){
          // 引用类型 字符串化进行比较
          if(type == 'object'){
            if(deep) {
               _compareObj(val,target[key],key,deep)
            }else if(JSON.stringify(val) !== JSON.stringify(target[key])) {
              changeKeys.push(fatherKey+'.'+key)
            }
          }
          // 基本类型 字符串化进行比较
          else {
            
            if (val === target[key]) {
              
            }else {
              changeKeys.push(fatherKey+'.'+key)
            }
          }
        }else {
          changeKeys.push(fatherKey+'.'+key)
        }
      }else {
        console.log(`此type对应操作删除了${key}属性`);
        changeKeys.push(key)
      }
    })
  }
  return changeKeys
}