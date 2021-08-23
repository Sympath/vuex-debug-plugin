
function typeCheck(type) {
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
function eachObj(obj,cb){
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

//  以下所有的module 都是指$vm.$store._modules.root._children.[模块]._rawModule
function generate(modules) {
    let type = modules.keys();

}

generate($vm.$store._modules.root._children)




// 1. 先初始化处理action 获取其对应的Type service


// moduleName: "charge",
// getter: "baseInfoObj && chargeDetail && chargeDetailStayPay",
// action: "getChargeDetailStayPay",
// api: "apiGetChargeDetailStayPay && /bill/charge/staypay/${params}?t=${Date.now()}",
// annotation: