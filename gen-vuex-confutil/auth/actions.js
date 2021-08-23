/* ============
 * Actions for the auth module
 * ============
 *
 * The actions that are available on the
 * auth module.
 */
import { get, cloneDeep } from 'lodash';
import types from './type';
import originRoutes from '@routes';
import app from '../app';
import service from '@/services/auth';
// import commonService from '@/services/common';
import main from '@/main';
import { getQueryString, deleteUrlParam } from '@/utils/tools';
import store from '../index';
import Vue from 'vue';
;

const routes = cloneDeep(originRoutes);
/* 路由引用类型 - 拷贝值 */
function copyRoutes (router) {
  return router ? router.map(item => Object.assign({}, item)) : [];
}

// 获取路由子组件
function getChild (list = [], arr) {
  if (list.length > 0) {
    list.some((item) => {
      arr.push(item.identity);
      if (item.children) {
        getChild(item.children, arr);
      }
      return false;
    });
  }
}
let authStrList = [];
// 处理权限验证数组为字符串数组
function dealAuthToStr (arr) {
  getChild(arr, authStrList);
}
// 获取模块列表
function getModuleList (arr = []) {
  const list = [];
  arr.some((item) => {
    list.push(item);
    return false;
  });
  return list;
}

// 获取权限下对应的路由
let sidebarRouterList = [];
function getAuthRouteList (routerMap, list = []) {
  const routeList = [];
  // sidebar & identity
  routerMap.filter((route) => {
    if (list.includes(route.name)) {
      if (route.children) {
        const children = route.children;
        route.children = getAuthRouteList(children, list);
      }
      routeList.push(route);
    }
    return false;
  });
  return routeList;
}

// 获取侧边栏, 根据类型
function getSidebarList (list = [], param) {
  // return route.meta && route.meta.sidebar;
  if (list.length > 0) {
    list.some((item) => {
      // 判断侧边栏类型 hisModule表示his physicalModule表示体检模块
      if (item.identity === param) {
        getChild(item.children, sidebarRouterList);
        return true;
      }
      return false;
    });
  }
  const authRouteList = getAuthRouteList(copyRoutes(routes), sidebarRouterList);
  return authRouteList;
}
let identity = '';
function getFirstTab (authList, params) {
  authList.forEach((item) => {
    if (item.identity === params) {
      identity = item.children[0].identity;
      delete item.children;
    } else if (item.children) {
      getFirstTab(item.children, params);
    }
  });
  return identity;
}

export default {
  // 获取验证码  图片
  getCodeImg ({ state, commit }, params) {
    return new Promise((resolve) => {
      service.apiGetCodeImg(params).then((data) => {
        // 添加图形验证码
        commit(types.ADD_VERIFY_CODE, data);
        resolve(data);
      });
    });
  },
  // 设置机构id
  async setHospId ({ state, commit }, params) {
    // const hospStdId = state.account.hospStdId;
    // if (!hospStdId || `${hospStdId}` !== `${params.hospStdId}`) {
    const promise = await service.apiHospSwitch(params)
      .then((data) => {
        // 机构纬度的区分
        sessionStorage.setItem('orgBizType', data.orgBizType);

        sessionStorage.removeItem('authList');
        sessionStorage.removeItem('account');
        // 1.登录成功, 存入用户信息
        if (data) {
          commit(types.ADD_ACCOUNT, {
            nickName: data.nickName,
            hospId: data.hospId,
            hospitalName: data.userOrgHosp && data.hospId === 0 ? data.userOrgHosp.orgName : data.hospitalName,
            hospitalList: data.userOrgHosp ? data.userOrgHosp.userHospitalList : [],
            orgId: data.orgId,
            staffId: data.staffId,
            opBizType: data.opBizType || 1,
            sourceId: params.sourceId,
            hospStdId: data.hospStdId,
            isTimeoutWhiteOrg: data.isTimeoutWhiteOrg,
            hospOrgStdCode: data.hospOrgStdCode,
            orgOrgStdCode: data.orgOrgStdCode,
            reportSource: data.hospitalExtend ? data.hospitalExtend.reportSource : ''
          });
        }
        if (!params.hospStdId) app.$router.push('/organization');
        if (!data.resourceList || !data.resourceList.length) return Promise.reject(data);
        const resourceList = data.resourceList || [];
        const hisModule = resourceList.find(o => o.identity === 'hisModule');
        const physicalModule = resourceList.find(o => o.identity === 'physicalModule');
        console.log(hisModule, physicalModule, 'hisModule, physicalModule');
        if (physicalModule && hisModule && hisModule.children) {
          const workDesk = hisModule.children.find(o => o.identity === 'home');
          if (workDesk) physicalModule.children.unshift(workDesk);
        }
        // 2.存入当前用户 当前医院 权限
        commit(types.ADD_AUTHS, resourceList);
        // 3.设置模块列表
        const list = getModuleList(resourceList);
        commit(types.ADD_MODULE_LIST, list);
        // 4.存入当前用户 转换为权限字符串数组
        authStrList = [];
        dealAuthToStr(resourceList);
        commit(types.ADD_AUTH_STR_LIST, authStrList);
        return Promise.resolve(data);
      })
      .catch((e) => {
        sessionStorage.removeItem('account');
        commit(types.ADD_ACCOUNT, { sourceId: params.sourceId, hospStdId: params.hospStdId });
        return Promise.reject(e);
      });
    return promise;
    // }
  },
  setSourceId ({ state, commit }, params) {
    commit(types.SET_SOURCE_ID, params);
  },
  // 获取验证码  短信
  getCodeSms ({ state }, params) {
    service.apiGetCodeSms(params);
  },
  // 获取验证码  短信 ac登录超时
  getCodeSmsAc ({ state }, params) {
    return new Promise((resolve) => {
      service.apiGetCodeSmsAc(params).then((data) => {
        resolve(data);
      });
    });
  },
  // 图片验证码验证登录 ac登录超时
  async loginImgAc ({ commit, state }, params) {
    const data = await service.apiGeetestPwdLogin(params);
    if (data) {
      commit(types.LOGIN_AC, data);
      store.dispatch('common/countTimeout');
      let name = get(app.$route, 'name', '');
      if (!state.outTimeWhiteList.includes(name)) {
        window.location.reload();
      } else {
        commit(types.LOGOUTAC, { isLogin: true, data: '' });
      }
    }
    return data;
  },
  // 短信验证码验证登录 ac登录超时
  loginSmsAc ({ commit, state }, params) {
    service.apiGeetestSmsLogin(params).then((data) => {
      commit(types.LOGIN_AC, data);
      store.dispatch('common/countTimeout');
      let name = get(app.$route, 'name', '');
      if (!state.outTimeWhiteList.includes(name)) {
        window.location.reload();
      } else {
        commit(types.LOGOUTAC, { isLogin: true, data: '' });
      }
    });
  },
  logoutByAc ({ commit }, data) {
    if (window.top !== window.self) { // 如果his是被嵌入的页面，就清除一系列缓存，不然是his本身就不能删，后端还要用到失效的token
      commit(types.LOGOUT);
    }
    commit(types.LOGOUTAC, data);
  },
  login ({ dispatch }) {
    // console.log(location.search);
    if (location.search.includes('sourceId')) localStorage.removeItem('account');
    let account;
    try {
      account = JSON.parse(localStorage.getItem('account'));
    } catch (e) {
      account = localStorage.getItem('account');
    }
    if (account && account.isTimeoutWhiteOrg !== undefined && account.isTimeoutWhiteOrg === false) return dispatch('logout');
    let qsRetryCount = ~~getQueryString('retry_count');
    // if (qsRetryCount) {

    // } else {
    //   qsRetryCount = 0;
    // }
    if (qsRetryCount <= 2) {
      qsRetryCount += 1;
    } else {
      return false;
    }

    // 通知父窗口退出登录
    // try {
    //   window.parent.postMessage({ type: 'loginout' }, '*');
    // } catch (err) {}

    if (location.search.includes('code')) {
      window.location.href = __globalEnv__.VUE_APP_AUTH_PC_LOCATION + encodeURIComponent(`${deleteUrlParam('code')}&retry_count=${qsRetryCount}`);
    } else {
      /* eslint-disable */
      let curLocation = location.href;
      if (location.href.includes('?')) {
        if (curLocation.includes('/notfound') || curLocation.includes('/forbidden')) {
          curLocation = window.location.origin;
        }
        window.location.href = __globalEnv__.VUE_APP_AUTH_PC_LOCATION + encodeURIComponent(`${curLocation}&retry_count=${qsRetryCount}`);
      } else {
        window.location.href = __globalEnv__.VUE_APP_AUTH_PC_LOCATION + encodeURIComponent(`${curLocation}?retry_count=${qsRetryCount}`);
      }
    }
    // }
    return true;
  },
  async loginAC({ commit, dispatch }, params) {
    const result = await service.apiLoginAC(params).then((data) => {
      commit(types.LOGIN_AC, data.token);
      const userInfo = data.homePageUser;
      if (!params.hospStdId) {
        app.$router.push('/organization');
        return Promise.resolve(data);
      }
      sessionStorage.removeItem('authList');
      sessionStorage.removeItem('account');
      // 1.登录成功, 存入用户信息
      if (userInfo) {
        commit(types.ADD_ACCOUNT, {
          nickName: userInfo.nickName,
          hospId: userInfo.hospId,
          hospitalName: userInfo.userOrgHosp && data.hospId === 0 ? userInfo.userOrgHosp.orgName : userInfo.hospitalName,
          hospitalList: userInfo.userOrgHosp ? userInfo.userOrgHosp.userHospitalList : [],
          orgId: data.orgId,
          opBizType: userInfo.opBizType || 1,
          staffId: userInfo.staffId,
          sourceId: params.sourceId,
          hospStdId: userInfo.hospStdId,
          isTimeoutWhiteOrg: userInfo.isTimeoutWhiteOrg,
          hospOrgStdCode: userInfo.hospOrgStdCode,
          orgOrgStdCode: userInfo.orgOrgStdCode
        });
        // 机构纬度的区分
        sessionStorage.setItem('orgBizType', userInfo.orgBizType);
        sessionStorage.setItem("uid", userInfo.wedoctorUserId);
      }
      if (!userInfo) return Promise.reject(userInfo);
      if (!userInfo.resourceList || !userInfo.resourceList.length) return Promise.reject(data);
      const resourceList = userInfo.resourceList || [];
      const hisModule = resourceList.find(o => o.identity === 'hisModule');
      const physicalModule = resourceList.find(o => o.identity === 'physicalModule');
      console.log(hisModule, physicalModule, 'hisModule, physicalModule');
      if (physicalModule && hisModule && hisModule.children) {
        const workDesk = hisModule.children.find(o => o.identity === 'home');
        if (workDesk) physicalModule.children.unshift(workDesk);
      }
      // 2.存入当前用户 当前医院 权限
      commit(types.ADD_AUTHS, resourceList);
      // 3.设置模块列表
      const list = getModuleList(resourceList);
      commit(types.ADD_MODULE_LIST, list);
      // 4.存入当前用户 转换为权限字符串数组
      authStrList = [];
      dealAuthToStr(resourceList);
      commit(types.ADD_AUTH_STR_LIST, authStrList);
      return Promise.resolve(data);
    })
    .catch((e) => {
      commit(types.ADD_ACCOUNT, {
        sourceId: params.sourceId,
        // hospStdId: params.hospStdId,
      });
      return Promise.reject(e);
    });
    return result;
  },
  // 用户登录  密码登录
  loginPsd({ state, commit, dispatch }, params) {
    return new Promise((resolve, reject) => {
      service.apiLoginPsd(params)
        .then((data) => {
          // 登录成功, 存入token
          commit(types.LOGIN, data);
          app.$router.push('/organization');// 跳转到组织页面
          resolve(data);
        }, (e) => {
          reject(e);
        });
    });

  },
  // 用户登录  短信登录
  loginSms({ state, commit, dispatch }, params) {
    service.apiLoginSms(params).then((data) => {
      // 登录成功, 存入token
      commit(types.LOGIN, data);
      app.$router.push({ path: '/organization' });
    });
  },
  // 用户软退出，重新加载页面，重新走 login
  logoutSoft({ commit }, isTool = true) {
    const vm = new Vue();
    // 清除缓存
    commit(types.LOGOUT);
    // 通知父窗口退出登录
    try {
      window.parent.postMessage({ type: 'loginout' }, '*');
    } catch (err) {}
    if(document.getElementsByClassName('el-message').length === 0) {
      if (isTool) {
        vm.$message.error('登录失效，即将重新登录');
      }
      setTimeout(() => {
        store.dispatch('auth/login');
      },3000)
    }
    
  },
  // 用户退出登录
  logout({ commit, dispatch }) {
    // service.apiLogout(params).then(() => {
      // 退出成功, 存入token
    // });
    service.apiACLogout()
    .finally(() => {
      commit(types.LOGOUT);
      // 通知父窗口退出登录
      try {
        window.parent.postMessage({ type: 'loginout' }, '*');
      } catch (err) {}
        // 通知iframe子窗口退出登录
        try {
          document.querySelector('iframe[iframe-type]').contentWindow.postMessage('logout', '*');
        } catch {}

        dispatch('layout/setMenuActive', '0', { root: true });// 设置选中为0

        if (location.search.includes('code')) {
          let curPath = location.pathname;
          if (curPath.includes('notfound') || curPath.includes('forbidden')) {
            curPath = '';
          }
          window.location.href = __globalEnv__.VUE_APP_LOGOUT_PC_LOCATION
            + encodeURIComponent(__globalEnv__.VUE_APP_AUTH_PC_LOCATION + location.origin + curPath);
        } else {
          let curLocation = location.href;
          if (curLocation.includes('notfound') || curLocation.includes('forbidden')) {
            curLocation = location.origin;
          }
          window.location.href = __globalEnv__.VUE_APP_LOGOUT_PC_LOCATION
            + encodeURIComponent(__globalEnv__.VUE_APP_AUTH_PC_LOCATION + curLocation);
        }
    });
  },
  showTimeoutPanel({ commit }, params) {
    commit(types.TIMEOUT_PANEL, params);
  },
  // 获取机构列表
  getOrganizationList({ state, commit, dispatch }, params) {
    service.apiGetOrganizationList(params).then((data) => {
      commit(types.ADD_ORGANIZATION, data);
    });
  },
  // 获取机构列表   用户受邀机构
  getInvitationList({ state, commit, dispatch }, params) {
    service.apiGetInvitationList(params).then((data) => {
      data = data || [];
      // 移除已处理 消息
      commit(types.UPDATE_ORGANIZATION_INVITED,
        data.map(item => Object.assign(item, { isAccept: false })));
    });
  },
  // 获取用户所在机构下的医院信息
  getHospInOrgList({ state, commit, dispatch }, params) {
    service.apiGetListHospInOrg(params).then((data) => {
      commit(types.HOSP_IN_ORG_LIST, data);
      sessionStorage.setItem('orgBizType', data.orgBizType);
      if (+data.orgBizType === 2) {
        document.getElementsByTagName('body')[0].classList.add('global-zoom');
      } else {
        document.getElementsByTagName('body')[0].classList.remove('global-zoom');
      }
    });
  },
  // 用户受邀机构Oprate accept/refuse
  UpdateInvitation({ state, commit, dispatch }, params) {
    // service.apiUpdateInvitation(params).then((data) => {
    //   const { invitationId, invitStatus } = params;
    //   const org = state.organization.invitationList;
    //   const oprateOrgIndex = org.findIndex(item => item.id === invitationId);
    //   // 接收 2 ：状态改变 进入医院
    //   if (invitStatus === 2) {
    //     Object.assign(org[oprateOrgIndex], data, { isAccept: true });
    //   // 拒绝 3 ：移除该条记录
    //   } else if (invitStatus === 3) {
    //     org.splice(oprateOrgIndex, 1);
    //   }
    //   // 移除已处理 消息
    //   commit(types.UPDATE_ORGANIZATION_INVITED, org);
    //   console.log('datatdddd', data);
    //   debugger;
    //   commit(types.UPDATE_INVITATION_DATA, data);
    // });
    return new Promise((resolve) => {
      service.apiUpdateInvitation(params).then((data) => {
        const { invitationId, invitStatus } = params;
        const org = state.organization.invitationList;
        const oprateOrgIndex = org.findIndex(item => item.id === invitationId);
        // 接收 2 ：状态改变 进入医院
        if (invitStatus === 2) {
          Object.assign(org[oprateOrgIndex], data, { isAccept: true });
        // 拒绝 3 ：移除该条记录
        } else if (invitStatus === 3) {
          org.splice(oprateOrgIndex, 1);
        }
        // 移除已处理 消息
        commit(types.UPDATE_ORGANIZATION_INVITED, org);
        commit(types.UPDATE_INVITATION_DATA, data);
        resolve(data);
      });
    });
  },
  // 删除列表
  deleteInvitationList({ state, commit }, params) {
    commit(types.UPDATE_ORGANIZATION_INVITED, params);
  },
  getUserOrgHosp({ state, commit }, params) {
    return new Promise((resolve) => {
      service.apiGetUserOrgHosp(params)
      .then((data) => {
        resolve(data);
        commit(types.ADD_ACCOUNT, {
          hospitalName: data.hospId > 0 ? data.hospitalName : data.orgName,
          hospitalList: data.userHospitalList,
          orgId: data.orgId,
        });
      });
    });
  },
  // 获取用户信息  权限信息 机构-医院
  getUserAuth({ state, commit, dispatch }, params) {
    return new Promise((resolve, reject) => {
      service.apiGetUserAuth(params)
        .then((data) => {
          // 这里去处理获取到的权限数据，需要调整门诊为 1-hisModule，体检为 165-physicalModule，
          // console.log('当前登录的权限', data)
          data.resourceList = data.resourceList.sort((a, b) => a.id - b.id)
          resolve(data);
          // uid存到本地, 视频组件登录需要配置uid
          sessionStorage.setItem("uid", data.wedoctorUserId);
          if (data.orgBizType) {
            sessionStorage.setItem('orgBizType', data.orgBizType);
          }
          // console.log(app, 'videorefs');
        // console.log(data, 'getUserAuth');
        sessionStorage.removeItem('authList');
        sessionStorage.removeItem('account');
        // 1.登录成功, 存入用户信息
        commit(types.ADD_ACCOUNT, {
          userId: data.wedoctorUserId,
          nickName: data.nickName,
          hospOrgStdCode: data.hospOrgStdCode,
          orgOrgStdCode: data.orgOrgStdCode,
          hospId: data.hospId,
          hospitalName: data.userOrgHosp && data.hospId === 0 ? data.userOrgHosp.orgName : data.hospitalName,
          hospitalList: data.userOrgHosp ? data.userOrgHosp.userHospitalList : [],
          orgId: params.orgId,
          orgName: data.userOrgHosp ? data.userOrgHosp.orgName : '',
          staffId: data.staffId,
          isOrgAdmin: data.isOrgAdmin,
          isSwitchOrg: data.isSwitchOrg,
          hospStdId: data.hospStdId,
          isTimeoutWhiteOrg: data.isTimeoutWhiteOrg,
          phoneNum: data.phoneNum,
          mhealthVideoFastState: data.mhealthVideoFastState,
          medicareStaffCode: data.medicareStaffCode,
          encUserId: data.encUserId,
          loginId: data.loginId,
          hasConsultOpen: data.hasConsultOpen,
          gopsName: data.gopsName,
          opBizType: data.opBizType || 1,
          photoUrl: data.photoUrl ? data.photoUrl : '',
          reportSource:data.hospitalExtend ? data.hospitalExtend.reportSource:''
        });
        const resourceList = data.resourceList || [];
        const hisModule = resourceList.find(o => o.identity === 'hisModule');
        const physicalModule = resourceList.find(o => o.identity === 'physicalModule');
        // console.log(hisModule, physicalModule, 'hisModule, physicalModule');
        if (physicalModule && hisModule && hisModule.children) {
          const workDesk = hisModule.children.find(o => (o.identity === 'nhome'));
          if (workDesk) physicalModule.children.unshift(workDesk);
        }
        // 2.存入当前用户 当前医院 权限
        commit(types.ADD_AUTHS, resourceList);
        // 3.设置模块列表
        const list = getModuleList(resourceList);
        commit(types.ADD_MODULE_LIST, list);
        // 4.存入当前用户 转换为权限字符串数组
        authStrList = [];
        dealAuthToStr(resourceList);
        commit(types.ADD_AUTH_STR_LIST, authStrList);
        // 5.设置侧边栏
        const arr = [];
        list.some((item) => {
          arr.push(item.identity);
          return false;
        });
        let test = params.moduleName;
        if (data.userType === 3) {
          dispatch('layout/setModuleName', 'organizationModule', { root: true });
          dispatch('setSideBarList', 'organizationModule');
          test = 'organizationModule';
        }
        if (arr.includes(test)) {
          dispatch('setSideBarList', test);
        } else {
          let name = list && list.length && list[0] && list[0].identity;
          // 无权限，跳转到profile，设置模块名称为profile
          if (list.length === 0) {
            name = 'profile';
          }
          // dispatch('layout/setModuleName', test || name, { root: true }); 不知道为什么写test||name导致出现bug，现在先去掉
          dispatch('layout/setModuleName', name, { root: true });
          dispatch('setSideBarList', name);
        }
      }, (e) => {
        reject(e);
      });
    });
  },
  // 获取用户信息  个人信息
  getUserInfo({ state, commit, dispatch }, params) {
    return new Promise((resolve, reject) => {
      service.apiGetUserInfo(params)
      .then((data) => {
        // console.log('用户信息', data);
        resolve(data);
        commit(types.GET_USER_INFO, data);
      }, (e) => {
        reject(e);
      });
    });
  },
  // 设置侧边栏
  setSideBarList({ state, commit, dispatch }, param) {
    sidebarRouterList = [];
    const sidebarItem = JSON.parse(sessionStorage.getItem('sidebarList'));
    if (sidebarItem) {
      const list = sidebarItem && sidebarItem[param];
      // 去session缓存侧边栏
      if (list && list.length) {
        commit(types.ADD_SIDEBAR_LIST, list);
        if (!main.$route.path.includes('/home')) {
          app.$router.push({ name: list[0] && list[0].name });
        }
        return;
      }
    }
    dispatch('layout/setModuleName', param, { root: true });// 设置默认模块
    const authList = state.authList;
    // getSidebarList(routes)
    const sidebarList = getSidebarList(authList, param);
    // debugger;
    commit(types.ADD_SIDEBAR_LIST, sidebarList);
    // 合并sidebar 存入到缓存中
    const obj = {};
    obj[param] = sidebarList;
    // debugger;
    sessionStorage.setItem('sidebarList', JSON.stringify(Object.assign({}, sidebarItem, obj)));
    // 如果没有配置权限，则跳转到个人中心
    if (sidebarList.length === 0) {
      app.$router.push('/profile');
      return;
    }
    const memberSideBarList = ['cardmanage', 'cardbuy', 'customer', 'offline-service', 'workOrder']; // 会员拆分出去的用正则匹配的路由的name
    if (memberSideBarList.indexOf(get(sidebarList, '[0].name')) > -1) { // 临时处理跳到会员iframe页白屏的问题
    // if (get(sidebarList, '[0].name') === 'customer') { // 临时处理跳到客户管理页白屏的问题
      let { path, meta = {}} = sidebarList[0];
      let toPath = get(meta, 'patternPath.enabled') ? 
        get(meta, 'patternPath.default', path) :
        path;

      app.$router.push(toPath);
      return;
    }
    app.$router.push({ name: sidebarList[0] && sidebarList[0].name });
  },
  getAuthFirstTab({ state, commit }, param) {
    const authList = JSON.parse(sessionStorage.getItem('authList'));
    const getFirstTabList = getFirstTab(authList, param);
    commit(types.GET_FIRST_TAB, getFirstTabList);
  },
  // 初始化页面
  initPage({ commit }, param) {
    commit(types.INIT_PAGE, param);
  },
  // 重置密码
  resetPassword({ commit }, params) {
    return new Promise((reslove, reject) => {
      service.apiResetPassword(params).then((res) => {
        reslove(res);
      }).catch(() => reject());
    });
  },
  // 获取极验
  async getGeetest({ commit }, params) {
   const data = await service.apiGetGeetest(params);
   return data;
  },
  setGeetestCaptcha({ commit }, params) {
    commit(types.SET_GEETEST_CAPTCHA, params);
  },

  // 获取用户信息
  getUserId () {
    service.apiGetUserId().then(res => {
      // 这里去修改获取到的用户信息，保证门诊管理的顺序
      localStorage.setItem('userInfo', JSON.stringify(res))
    }).catch(() => {
      localStorage.setItem('userInfo', JSON.stringify(null))
    });
  },

  // 设置路由 map
  setRouterMap ({ commit }, params) {
    commit(types.ROUTER_INFO_MAP, params);
  }
};
