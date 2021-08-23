import tableRender from "../components/we-table-dynamic";
import { creatDom, mountToBody, setStyle } from "./dom";
import { data } from "./import";


let Vue;
let h; // 用于存储$createElement函数
let hasElementUI; // 用户传递的配置项
let delay = 1000;
// 初始化时渲染插件所要渲染的组件  main入口函数
export function renderVuexDebugPlugin(_Vue,_hasElementUI) {
    Vue = _Vue;
    hasElementUI = _hasElementUI;
    renderChooseBtn()
    setStyle({
        'vuex-msgbox': {
            width: '1000px!important'
        },
        'vuex-msgbox .el-col-12':{
            height: '40px'
        },
        'vuex-msgbox .vuex-link': {
            color: '#ccc'
        },
        'vuex-msgbox .vuex-link span.actived': {
            color: '#409EFF'
        },
        'vuex-msgbox .vuex-link.actived': {
            color: '#409EFF'
        }

    })
}

// 渲染控制的按钮
function renderChooseBtn(){
    if(data.notFirstRenderChooseBtn) return;
    data.notFirstRenderChooseBtn = true;
    let domOptions = {tag:'div',text:'vuex',opts:{
      style: {
        position : "fixed",
        bottom : "10px",
        left : "140px", // 70 是vmDebugPlugin的定位 后期需优化成动态的 w-todo
        cursor : "pointer",
        width: '40px',
        height: '40px',
        lineHeight: '40px',
        backgroundColor: '#38f',
        borderRidus: '50%',
        width: '40px',
        zIndex: '9999',
        fontSize: '13px',
        textAlign: 'center',
        borderRadius: '50%',
        color: 'white',
        boxShadow: '2px 3px 5px #999',
        cursor: 'pointer',
      },
      class : 'vuex_debug_class',
      on:{
        click(){
          data.showPhanel = !(data.showPhanel);
          renderChoosePhanel()
        }
      }
    },childrens:[]};
    let div = creatDom(domOptions)
    mountToBody(div)
    // 用于解决没有使用UI框架的情况
    let domOptions2 = {tag:'div',text:'',opts:{
      style: {
        position : "fixed",
        // bottom : "200px",
        // left : "0",
        // right : "0",
        // top : "0",
        // bottom : "0",
        cursor : "pointer"
      },
      class : 'vuex_debug_pannel_class',
      on:{
        click(){
          // notice('设置成功')
        }
      }
    },childrens:[]};
    let div2 = creatDom(domOptions2)
    mountToBody(div2)
  }

  // 需重写 以实现无elementUi 的情况
        // 渲染显示的面板
        function renderChoosePhanel(){
            // 保存createElement函数
            if(!h){
                // if(data.mappChannelInstance){

                //     h = data.mappChannelInstance ? data.mappChannelInstance.$createElement : ()=>{ console.log('未获取h函数');};
                // }else {
                //     h = data.currentPageVm ? data.currentPageVm.$createElement : ()=>{ console.log('未获取h函数');};
                // }
                h = data.h;
            }
            // let hasElementUI = false; // 项目是否接入了elementUi
            if(hasElementUI){
              if(!Vue.prototype.$msgbox) {
                hasElementUI = false; // 避免用户搞错
                notice('您没有接入elementUi哦,msgbox方法查找不到')
              }
            }    
            // 如果有ui框架 就美化一下吧~
            if (hasElementUI) {
              _renderChoosePhanelForElement.call(this)
            } else {
              _renderChoosePhanelForNormal.call(this)
            }
            
            function _renderChoosePhanelForElement(){
                let tableProps = {
                    'highlight-current-row': true,
                    size: 'large',
                    'header-cell-class-name': "we-table-header-cell",
                    'cell-class-name': "we-table-cell",
                    border: true,
                    style: "width: 1000px;"
                }
                // | type（commit时的type参数） | Getter（对应的属性） | API（接口地址） | APIDOCs（接口文档地址） |
                let tableColumns = [
                    {
                      label: 'commit时的type参数',
                      prop: 'showType',
                      width: '200'
                    },
                    {
                      label: 'Getter（对应的属性）',
                      prop: 'getter',
                      width: '200'
                    },
                    {
                      label: 'Action',
                      prop: 'action',
                      width: '200'
                    },
                    {
                      label: 'API（接口地址）',
                      prop: 'api',
                      width: '200'
                    },
                    {
                      label: '备注信息',
                      prop: 'annotation',
                      width: '200'
                    },
                    {
                      label: '操作',
                      prop: 'api',
                      width: '200',
                      renderCell: (h, {row,column,$index}) => {
                        return h('el-link',{
                          props: {
                            href: row.apiDocsLink,
                            // icon: 'el-icon-view',
                            underline: false
                          },
                          attrs: {
                            target: "_blank"
                          }
                        },'查看接口文档')
                      }
                    },
                ]
              function generateTableComponent(columns,list){
                return tableRender(h, {
                      columns,
                      tableProps,
                      list
                    })   
              }
              function generateLayout(header,content) {
                return h('div', {},[
                    h('el-header', {style: {
                        paddingLeft: '60px'
                    }},[header]),
                    h('el-main', {},[content])
                ])
            }
            function generateLayoutContent() {
              return generateTableComponent(tableColumns,data.targetList);
            }
            function generateLayoutHeader() {
                // 顶部功能按钮
                let children = [h('el-button',{
                    on: {
                        click(){
                            notice('重置成功')
                            _data.setRouteVm(data.routeVmList.length -1);
                        }
                    }
                },'待完成功能项')];
                let content = children.map(c => h(
                    'el-col',{
                        props: {
                            span: 6
                        }
                    },
                    [c]
                ))
                return h('el-row', {
                    gutter: 20
                },content)
            }
            let layoutHeader = generateLayoutHeader();
            let layoutContent = generateLayoutContent();
            // generateTabs({
            //     props: {
            //         // type: 'border-card',
            //         stretch: 'true',
            //         'tab-position':"left"
            //     },
            //     events: {
                    
            //     },
            //     children
            // },data,'currentRouteKey')
            let message = generateLayout(layoutHeader,layoutContent);
              // let message = 
              Vue.prototype.$msgbox({ 
                title: 'Vuex数据映射列表',
                message,
                customClass: 'vuex-msgbox',
                showCancelButton: false,
                showConfirmButton: true,
                showClose: false,
                confirmButtonText: '关闭面板',
                beforeClose: (action, instance, done) => {
                  done()
                }
              }).then(action => {
                if(action == 'confirm'){
                    
                }else {
      
                }
              },()=>{})
            }
            // function _renderChoosePhanelForNormal() {
            //   // 渲染无elementUi状态下的插件面板 w-todo
            //   function generateTableComponent(columns,list){
            //     return (
            //       <div>
            //         <table table className='tabel' border="2">
            //           <thead className='theads'>
            //             <tr>
            //               {
            //               columns.map((head,index)=>
            //                 <th key={index}>{head.label}</th> ) 
            //               }
            //             </tr>
            //           </thead>
  
            //         </table>
            //       </div>
            //     )
            //   }
            //   if(data.showPhanel){
            //     let domOptions = {tag:'div',text:'vuex插件对无elementUi状态下的处理待优化哦~，敬请期待',opts:{
            //       style: {
            //         position : "fixed",
            //         bottom : "500px",
            //         left : `50%`,
            //         transform: 'translateX(-50%)',
            //         cursor : "pointer",
            //         zIndex: 99,
            //         color: 'rgb(51, 136, 255)'
            //       },
            //       class : 'vuex_pannel_class',
            //     },childrens:[]}
            //     let listItem = creatDom(domOptions)
            //     // mountToBody(listItem)
            //     $mount('.vuex_debug_pannel_class',listItem)
            //   }else {
            //     remove_items('.vuex_debug_pannel_class')
            //   }
            // }
          }