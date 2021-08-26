import { eachObj, mergeArr } from "../../util";

export default function searchPlugin(data) {
    data.keyWord = '';
    function filterListByKeyWord( keyword , keywordType) {
      return data.sourceList.filter(source => {
        let {
          type,
          getter,
          action,
          api
        } = source;
        let isChoosed = false;
        eachObj({
          type,
          getter,
          type,
          action,
          api
        }, (key , val) => {
          if(val.indexOf(keyword) > -1){
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
          var input = document.querySelector('#search');
          input.addEventListener('input', function(e) {
            data.keyWord = e.target.value;
          })
        }, 1000);
        return (
          <div data-v-01f94fbc="" class="el-input el-input--small el-input--suffix" style="width: 200px;">
          <input type="text" autocomplete="off" id="search" placeholder="请输入getter/type/action/api" class="el-input__inner"/>
          <span class="el-input__suffix">
              <span class="el-input__suffix-inner">
                  <i
                    onClick={
                      ()=>{
                        if (data.keyWord === '') {
                          notice('关键词不能为空');
                          return;
                        }
                        let filterList = filterListByKeyWord( data.keyWord);
                        if(filterList.length > 0){
                          data.targetList.length = 0;
                          mergeArr(data.targetList, filterList)
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