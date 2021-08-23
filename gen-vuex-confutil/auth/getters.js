export default {
  isAuth: state => state.authenticated,
  isLogin: state => state.isLogin,
  userMobile: state => state.userMobile,
  isShowLayout: state => state.isShowLayout,
  role: state => state.role,
  verifyImgCode: state => state.verifyImgCode, // 图形验证码
  getAccount: state => state.account,
  organization: state => state.organization,
  organizationLocal: state => state.organization.orgList,
  organizationInvited: state => state.organization.invitationList,
  hospInOrgList: state => state.hospInOrgList, // 用户所在机构下的医院信息
  authList: state => state.authList,
  getOrgId: state => state.orgId,
  // 依据权限变动(切换用户)
  sidebarList: state => state.sidebarList,
  moduleList: state => state.moduleList, // 模块列表
  authFirstTab: state => state.authFirstTab,
  userInfo: state => state.userInfo, // 用户信息
  organizationData: state => state.organizationData,
  timeoutPanel: state => state.timeoutPanel,
  geetestCaptcha: state => state.geetestCaptcha,
  // 权限 id map
  getAuthIdMap: state => state.authIdMap,
  // 权限 identity map
  getAuthIdentityMap: state => state.authIdentityMap,
  // 权限 路由信息 map
  getRouterInfoMap: state => state.routerInfoMap
};
