import { eachObj, mergeArr } from "../../util";

export default function searchServicePlugin(data) {
    data.serviceKeyWord = '';
    function filterListByKeyWord( keyword , keywordType) {
      return data.serviceList.filter(source => {
        let {
          serviceName,
          api,
          moduleName
        } = source;
        let isChoosed = false;
        eachObj({
          serviceName,
          api
        }, (key , val) => {
          if (keyword === 'all') {
            isChoosed = true;
          }
          if((val || '').indexOf(keyword) > -1){
            isChoosed = true;
          }
        })
        return isChoosed; 
      })
      
    }
    return {
      type: '1',
      handler: (h, notice) => {
        setTimeout(() => {
          var input = document.querySelector('#serviceSearch');
          input.addEventListener('input', function(e) {
            data.serviceKeyWord = e.target.value;
          })
        }, 1000);
        return (
          <div data-v-01f94fbc="" class="el-input el-input--small el-input--suffix" style="width: 200px; position: relative;margin-left: 70px;">
              <span style="position: absolute; left: -55px;top: 50%;transform: translateY(-50%);">service：</span><input type="text" autocomplete="off" id="serviceSearch" placeholder="请输入serviceName/api" class="el-input__inner"/>
              <span class="el-input__suffix">
                  <span class="el-input__suffix-inner">
                      <i
                        onClick={
                          ()=>{
                            if (data.serviceKeyWord === '') {
                              notice('关键词不能为空');
                              return;
                            }
                            let filterList = filterListByKeyWord( data.serviceKeyWord);
                            if(filterList.length > 0){
                              data.serviceTargetList.length = 0;
                              data.tableType = 2;
                              mergeArr(data.serviceTargetList, filterList)
                              notice('搜索成功');
                            }else {
                              notice('搜索结果为空');
                            }
                          }
                        }  
                        data-v-01f94fbc="" class="el-icon-search el-input__icon"></i>
                  </span>
              </span>
          </div>
        )
      }
    }
  }