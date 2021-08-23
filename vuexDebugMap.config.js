export default {
  "GET_CHARGE_DETAIL && GET_CHARGE_DETAIL && GET_CHARGE_DETAIL_STAYPAY": {
    moduleName: "charge",
    getter: "baseInfoObj && chargeDetail && chargeDetailStayPay",
    action: "getChargeDetailStayPay",
    api: "apiGetChargeDetailStayPay && /bill/charge/staypay/${params}?t=${Date.now()}",
    annotation:
      "待支付账单详情-防止浏览器缓存：账单基本信息 && 详情本身 && 详情本身",
  },
  GET_PAY_TYPES: {
    moduleName: "charge",
    getter: "payTypes",
    action: "getPayTypeList",
    api: "apiGetPayTypeList && /bill/charge/payTypeList/${params}",
    annotation: "获取结算方式",
  },
  "GET_CHARGE_DETAIL && GET_CHARGE_DETAIL_STAYPAY": {
    moduleName: "charge",
    getter: "chargeDetail && chargeDetailStayPay",
    action: "getStayPayByPayType",
    api: "apiGetStayPayByPayType && /bill/charge/getStayPayByPayType/${params.billId}/${params.payType}",
    annotation: "根据结算方式获取最新收费账单信息",
  }
};
