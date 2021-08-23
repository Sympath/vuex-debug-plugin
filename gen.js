 // 获取被赋值的属性
function testForGetState() {
    let fnStr = `function (state, account) {\n  var sessionAccount = '';\n\n  try {\n    sessionAccount = JSON.parse(sessionStorage.getItem('account'));\n  } catch (e) {\n    sessionAccount = sessionStorage.getItem('account') || {};\n  }\n\n  if (account) {\n    state.account = _objectSpread({}, account, {}, sessionAccount);\n    state.isAuth = true;\n    account = JSON.stringify(state.account);\n    sessionStorage.setItem('account', account);\n    localStorage.setItem('account', account);\n  } else {\n    account = sessionStorage.getItem('account');\n\n    if (account) {\n      state.account = JSON.parse(account);\n      state.isAuth = true;\n    }\n  }\n}`
   
    let regexp = /(?<=state.)(\w+)/g
    console.log([...new Set(fnStr.match(regexp))]);
}
// testForGetState()


// 根据serviceName获取接口地址
function getApiByService(serviceFnStr) {
  // data.service.auth.apiResetPassword
  var regexpForApi = /(?<=\(').*(?=\))/g; 
  let results = serviceFnStr.match(regexpForApi)
  return results[0];
}
let serviceFnStr = `
"function apiGetFormConfigOrgList() {
  return _axios__WEBPACK_IMPORTED_MODULE_0__["default"].get('/user-auth/user/invitation-list');
}"
`
console.log(getApiByService(serviceFnStr));


 // 获取api对应的接口地址
function testForGetApi() {
  debugger
    let fnStr = `
    function getOrgFormList(_ref23, params) {
        return _babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_1___default()(
        /*#__PURE__*/
        _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default.a.mark(function _callee3() {
          var commit, res;
          return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default.a.wrap(function _callee3$(_context3) {
            while (1) {
              switch (_context3.prev = _context3.next) {
                case 0:
                  commit = _ref23.commit;
                  res = [];
                  _context3.prev = 2;
                  _context3.next = 5;
                  return _services_common__WEBPACK_IMPORTED_MODULE_3__["default"].apiGetFormConfigOrgList(params);
    
                case 5:
                  _context3.t0 = _context3.sent;
    
                  if (_context3.t0) {
                    _context3.next = 8;
                    break;
                  }
    
                  _context3.t0 = [];
    
                case 8:
                  res = _context3.t0;
                  _context3.next = 14;
                  break;
    
                case 11:
                  _context3.prev = 11;
                  _context3.t1 = _context3["catch"](2);
                  console.log(_context3.t1);
    
                case 14:
                  localStorage.setItem('ORG_CONFIG_LIST', JSON.stringify(res));
                  commit(_type__WEBPACK_IMPORTED_MODULE_2__["default"].SET_ORG_CONFIG_LIST, res);
                  return _context3.abrupt("return", res);
    
                case 17:
                case "end":
                  return _context3.stop();
              }
            }
          }, _callee3, null, [[2, 11]]);
        }))();
      }
    `
    function getServiceNamesByType(type) {
         // 获取api对应的方法名
        let regexpForService = /(?<=api)(\w+)/g
        let serviceNames = [];
        // 先判断是否调用了commit 未调用则进行匹配
        if(fnStr.indexOf("commit(") == -1){
            serviceNames = fnStr.match(regexpForService);
        }
        // 有调用则通过type进行一层过滤匹配
        else if(fnStr.indexOf(type)> -1) {
            serviceNames = fnStr.match(regexpForService);
        } else {

        }
        // 将api字符串拼接回去 
        return serviceNames.map(serviceName => `api${serviceName}`);
    }
    // 根据serviceName获取接口地址
    function getApiByService(serviceFnStr) {
      // data.service.auth.apiResetPassword
      var regexpForApi = /(?<=\(').*(?=\))/g; 
      let results = serviceFnStr.match(regexpForApi)
      return results[0];
    }
    let serviceNames =  getServiceNamesByType('SET_ORG_CONFIG_LIST')
    let serviceFnStr = `
      "function apiGetFormConfigOrgList() {
        return _axios__WEBPACK_IMPORTED_MODULE_0__["default"].get('/user-auth/user/invitation-list');
      }"
`   
    let apis = serviceNames.map(serviceName => getApiByService(serviceFnStr))
    console.log([...new Set(apis)]);
    return apis
}

// testForGetApi()

