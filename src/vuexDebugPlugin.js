import {callFn,eachObj, typeCheck,tf,getVal} from '../util';
import WeTableDynamic from './components/we-table-dynamic.vue';
function pluginFn(options){
    let h; // 用于存储$createElement函数
    let {
        hasElementUI,  // 项目是否接入了elementUi w-todo 后面可以兼容iview之类的组件库 或者自定义
        Vue,
        sourceMap
    } = options;
    let targetList = [];
    let tableProps = {
        'highlight-current-row': true,
        size: 'large',
        'header-cell-class-name': "we-table-header-cell",
        'cell-class-name': "we-table-cell",
        border: true,
        style: "width: 800px;"
    }
    // | type（commit时的type参数） | Getter（对应的属性） | API（接口地址） | APIDOCs（接口文档地址） |
    let tableColumns = [
        {
          label: 'commit时的type参数',
          prop: 'type',
          width: '200'
        },
        {
          label: 'Getter（对应的属性）',
          prop: 'getter',
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
    function initVuexDebugPlugin(){
        let data = {
            showPhanel: false,// 控制是否显示面板 仅用于无ui框架状态
            notFirstRenderChooseBtn: false
        }
        importPlugin();
        renderVmDebugPlugin();
        function importPlugin(){
            //  mixin 此处要注入路由切换时清空targetList的逻辑
            Vue.component('WeTableDynamic',WeTableDynamic)
        }
        // 渲染插件
        function renderVmDebugPlugin() {
          renderChooseBtn()
          // renderChoosePhanel()
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
              zIndex: '1024',
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
          let styleOption = {
              tag: 'style',
              text: `.vuex-msgbox {
                  width: 1000px!important
              }`
          }
          let styleDom = creatDom(styleOption)
          document.getElementsByTagName('head').item(0).appendChild(styleDom);
        }
        // 需重写 以实现无elementUi 的情况
        // 渲染显示的面板
        function renderChoosePhanel(){
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
            function generateTableComponent(columns,list){
                return (
                    <we-table-dynamic
                        columns={columns}
                        tableProps={tableProps}
                        list={list}
                    >
                    </we-table-dynamic>
                )
            }
            let message = generateTableComponent(tableColumns,targetList)
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
          function _renderChoosePhanelForNormal() {
            // 渲染无elementUi状态下的插件面板 w-todo
            function generateTableComponent(columns,list){
              return (
                <div>
                  <table table className='tabel' border="2">
                    <thead className='theads'>
                      <tr>
                        {
                        columns.map((head,index)=>
                          <th key={index}>{head.label}</th> ) 
                        }
                      </tr>
                    </thead>

                  </table>
                </div>
              )
            }
            if(data.showPhanel){
              let domOptions = {tag:'div',text:'vuex插件对无elementUi状态下的处理待优化哦~，敬请期待',opts:{
                style: {
                  position : "fixed",
                  bottom : "500px",
                  left : `50%`,
                  transform: 'translateX(-50%)',
                  cursor : "pointer",
                  zIndex: 99,
                  color: 'rgb(51, 136, 255)'
                },
                class : 'vuex_pannel_class',
              },childrens:[]}
              let listItem = creatDom(domOptions)
              // mountToBody(listItem)
              $mount('.vuex_debug_pannel_class',listItem)
            }else {
              remove_items('.vuex_debug_pannel_class')
            }
          }
        }
        function mountToBody(dom){
          var bo = document.body; //获取body对象.
          //动态插入到body中
          bo.insertBefore(dom, bo.lastChild);
        }
        function creatDom(domOpts){
              let {tag,text,opts,childrens = []} = domOpts;
                          //创建一个div
              var dom = document.createElement(tag);
              dom.innerHTML = text; //设置显示的数据，可以是标签．
        
              for (const key in opts) {
                if(key === 'style'){
                  let styleOpts = opts[key];
                  for (const styleKey in styleOpts) {
                    dom.style[styleKey] = styleOpts[styleKey]
                  }
                }
                if (key === 'class') {
                  dom.className = opts[key];
                }
                if (key === 'on') {
                  let eventOpts = opts[key];
                  for (const eventKey in eventOpts) {
                    let fn = eventOpts[eventKey]
                    dom.addEventListener(eventKey,fn)
                  }
                }
              }
              childrens.forEach(child => { 
                return dom.appendChild(createElm(child));
              });
              return dom;
        }
        function $mount(el,dom){
          el = document.querySelector(el);
          el.appendChild(dom);
        }
        function remove_items(className) {
          var pannel = document.querySelector(className)
          if(pannel && pannel.innerHTML) pannel.innerHTML = ""
        }
        function notice(msg,type = 'success') {
          if(hasElementUI) Vue.prototype.$message({message:msg,type})
          else {
            alert(msg)
          }
        }
    }
    function vuexDebugPlugin() {
        return function (store) {
            h = typeCheck('Function')(store._vm.$createElement) ? store._vm.$createElement : () => {
                console.log('未获取到$createElement');
            }
            initVuexDebugPlugin()
            store.subscribe((mutations,state) => {
                if(sourceMap[mutations.type]){
                targetList.push({
                    type: mutations.type,
                    ...(sourceMap[mutations.type])
                })
                }
                // console.log('=========',mutations,state);
            })
        }
    }
    return vuexDebugPlugin
}
export default pluginFn

