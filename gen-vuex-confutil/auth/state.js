export default {
  isAuth: '', // token
  isLogin: false, // choose organization & hospital
  userMobile: '',
  role: 0, // 超级管理员？
  // 图形验证码
  verifyImgCode: {
    key: '',
    verifyCode: ''
  },
  account: {
    nickName: null,
    news: 0,
    hospitalName: '',
    hospId: '',
    hospitalList: []
  },
  isShowLayout: true,
  organizationInvitation: [],
  organizationLocal: [],
  organizationData: {},
  organization: {
    orgList: [
      /* {
        orgId: '',
        name: '',
      }, */
    ],
    invitationList: [
      /* {
        id: '',
        orgName: '',
        hospitalName: '',
      }, */
    ]
  },
  // 解析后台权限为数组集合
  authStrList: [],
  // {title, route, icon, idenfity}
  authList: [],
  authIdMap: new Map(),
  authIdentityMap: new Map(),
  sidebarList: [],
  authFirstTab: '',
  moduleList: [
    {
      id: '000',
      identity: 'hisModule',
      name: '云his'
    },
    {
      id: '001',
      identity: 'physicalModule',
      name: '体检中心'
    }
  ],
  whiteList: [],
  userInfo: '', // 用户信息
  timeoutPanel: false,
  outTimeWhiteList: [
    'schedule/rule/modify', 'schedule/rule/new', 'schedule/new', 'medicalInsurance/quickControl', 'branch/organcheck',
    'branch/carry_detail', 'clinic/detail/cas', 'order/detail/bookInfo', 'order/detail/nursingDetails', 'order/edit', 'book/add'
  ], // 超时登录白名单
  geetestCaptcha: null,
  hospInOrgList: {}, // 用户所在机构下的医院信息
  // 用来存当前路由信息的 map
  routerInfoMap: new Map()
};
