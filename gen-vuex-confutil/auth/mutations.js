import types from './type';

import cookie from '@/utils/cookie';
import utils from '@/utils/index';
import { translateArrayToMap } from '@/utils';

export default {
  [types.LOGIN] (state, token) {
    cookie.set('his_token', token, { domain: utils.getDomain() });
    state.isLogin = true;
  },
  [types.LOGOUT] (state) {
    state.isAuth = false;
    state.isLogin = false;
    state.organizationLocal = [];// 清空机构
    sessionStorage.clear();
    localStorage.removeItem('account');
    cookie.remove('his_token', { domain: utils.getDomain() });
    cookie.remove('his_token');
    cookie.remove('Histoken', { domain: utils.getDomain() }); // 删除住院免登接口返回的token
    cookie.remove('Histoken');
  },
  [types.LOGOUTAC] (state, data) {
    state.isLogin = data.isLogin;
    state.userMobile = data.data;
    state.timeoutPanel = !!data.timeoutPanel;
  },
  [types.LOGIN_AC] (state, token) {
    // cookie.remove('his_token');
    cookie.set('his_token', token, { domain: utils.getDomain() });
    state.isLogin = true;
  },
  [types.ADD_VERIFY_CODE] (state, data) {
    state.verifyImgCode = data;
  },
  // [VERIFYCODESMS](state, verify) {
  //   Object.assign(state.verify, verify);
  // },
  [types.ADD_ACCOUNT] (state, account) {
    let sessionAccount = '';
    try {
      sessionAccount = JSON.parse(sessionStorage.getItem('account'));
    } catch (e) {
      sessionAccount = sessionStorage.getItem('account') || {};
    }
    if (account) {
      state.account = { ...account, ...sessionAccount };
      state.isAuth = true;
      account = JSON.stringify(state.account);
      sessionStorage.setItem('account', account);
      localStorage.setItem('account', account);
    } else {
      account = sessionStorage.getItem('account');
      if (account) {
        state.account = JSON.parse(account);
        state.isAuth = true;
      }
    }
  },
  [types.ADD_ORGANIZATION] (state, list) {
    state.organization.orgList = list;
  },
  [types.UPDATE_ORGANIZATION_INVITED] (state, list) {
    state.organization.invitationList = list;
    sessionStorage.setItem('organizationInvited', JSON.stringify(list));
  },
  [types.UPDATE_INVITATION_DATA] (state, list) {
    state.organizationData = list;
  },
  [types.HOSP_IN_ORG_LIST] (state, list) {
    state.hospInOrgList = list;
  },
  // 权限列表  权限路由 & 权限侧边栏 & 权限主页 生成
  [types.ADD_AUTHS] (state, authList) {
    state.authList = authList;
    sessionStorage.setItem('authList', JSON.stringify(authList));
    const authIdMap = translateArrayToMap(authList);
    const authIdentityMap = translateArrayToMap(authList, 'identity');
    // console.log(authIdMap, authIdentityMap);
    state.authIdMap = authIdMap;
    state.authIdentityMap = authIdentityMap;
  },
  [types.ADD_AUTH_STR_LIST] (state, authList) {
    state.authStrList = authList;
    sessionStorage.setItem('authStrList', JSON.stringify(authList));
  },
  [types.ADD_MODULE_LIST] (state, list) {
    state.moduleList = list;
    sessionStorage.setItem('moduleList', JSON.stringify(list));
  },
  // 侧边栏设置
  [types.ADD_SIDEBAR_LIST] (state, sidebarList) {
    state.sidebarList = sidebarList;
  },
  // 设置第一个tab页
  [types.GET_FIRST_TAB] (state, param) {
    state.authFirstTab = param;
  },
  // 初始化页面
  [types.INIT_PAGE] (state, param) {
    if (cookie.get('his_token', { domain: utils.getDomain() })) {
      state.isLogin = true;
      if (param.isCommon) return false;
    }
    if (sessionStorage.getItem('account')) {
      state.account = JSON.parse(sessionStorage.getItem('account'));
      state.isAuth = true;
    }
    if (sessionStorage.getItem('authList')) {
      const authList = JSON.parse(sessionStorage.getItem('authList'));
      state.authList = authList;
      const authIdMap = translateArrayToMap(authList);
      const authIdentityMap = translateArrayToMap(authList, 'identity');
      state.authIdMap = authIdMap;
      state.authIdentityMap = authIdentityMap;
    }
    if (sessionStorage.getItem('authStrList')) {
      state.authStrList = JSON.parse(sessionStorage.getItem('authStrList'));
    }
    if (sessionStorage.getItem('sidebarList')) {
      // 根据对应模块获取对应的侧边栏
      const sidebarList = JSON.parse(sessionStorage.getItem('sidebarList'));
      state.sidebarList = sidebarList && sidebarList[param];
    }
    if (sessionStorage.getItem('moduleList')) {
      // 根据对应模块获取对应的侧边栏
      const moduleList = JSON.parse(sessionStorage.getItem('moduleList'));
      state.moduleList = moduleList;
    }
    if (sessionStorage.getItem('organizationInvited')) {
      state.organization.invitationList = JSON.parse(sessionStorage.getItem('organizationInvited'));
    }
    return true;
  },
  // 用户信息
  [types.GET_USER_INFO] (state, param) {
    state.userInfo = param;
  },
  // sourceID
  [types.SET_SOURCE_ID] (state, params) {
    sessionStorage.setItem('sourceId', params.sourceId);
    state.isShosLayout = false;
  },
  [types.TIMEOUT_PANEL] (state, payload) {
    state.timeoutPanel = payload;
  },
  [types.SET_GEETEST_CAPTCHA] (state, payload) {
    state.geetestCaptcha = payload;
  },
  [types.ADD_AUTH_Map] (state, authList) {
    const authIdMap = translateArrayToMap(authList);
    const authIdentityMap = translateArrayToMap(authList, 'identity');
    state.authIdMap = authIdMap;
    state.authIdentityMap = authIdentityMap;
    // sessionStorage.setItem('authIdMap', JSON.stringify(payload.authIdMap));
    // sessionStorage.setItem('authIdentityMap', JSON.stringify(payload.authIdentityMap));
  },
  [types.ROUTER_INFO_MAP] (state, map) {
    state.routerInfoMap = map;
  }
};
