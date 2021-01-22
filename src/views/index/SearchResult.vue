<template>
  <div class="search-container">
    <a-collapse v-model:activeKey="activeKey" v-for="item in addFlagresult" :key="item.key" class="wrapper" @change="changeActivekey">
      <a-collapse-panel :key="item.key.toString()">
        <template #header>
          <div class="header-wrapper">
           <span v-if="item.filename.indexOf(searchValue)>-1">
             {{ item.filename.substr(0, item.filename.indexOf(searchValue)) }}
             <span style="background-color:rgb(253,255,11)">{{ searchValue }}</span>
             {{ item.filename.substr(item.filename.indexOf(searchValue) + searchValue.length) }}
           </span>
            <span v-else>{{ item.filename }}</span>
            <a-tag v-if="item.matched && item.matched.length!==0" color="pink" class="icon">
              {{ item.matched.length }}
            </a-tag>
            <a-tag v-else color="pink" class="icon">
              0
            </a-tag>
          </div>
        </template>
        <!--       长度大于2 折叠显示-->
        <template v-if="item.matched">
          <div class="first-wrapper">
            <p class="item-wrapper" v-for="item2 in item.matched.slice(0,2)" @click="triggerShow(item)">
                  <span v-if="item2.indexOf(searchValue)>-1">
                 {{ item2.substr(0, item2.indexOf(searchValue)) }}
                  <span style="background-color: rgb(253,255,11)">{{ searchValue }}</span>
                 {{item2.substr(item2.indexOf(searchValue) + searchValue.length) }}
                    </span>
              <span v-else>{{ item2 }}</span>
            </p>
          </div>
          <a-collapse v-if="item.matched.length>2" :bordered="false" >
            <a-collapse-panel :key="Math.random().toString()" :showArrow="false">
              <template  #header>
                <p v-if="item.collapseFlag"  @click="item.collapseFlag =!item.collapseFlag" class="show-more">点击查看全部</p>
                <p v-else  @click="item.collapseFlag =!item.collapseFlag" class="show-more">收起</p>
              </template>
              <p class="item-wrapper" v-for="item3 in item.matched.slice(2)" @click="triggerShow(item)">
                 <span v-if="item3.indexOf(searchValue)>-1">
                 {{ item3.substr(0, item3.indexOf(searchValue)) }}
                  <span style="background-color: rgb(253,255,11)">{{ searchValue }}</span>
                 {{item3.substr(item3.indexOf(searchValue) + searchValue.length) }}
                 </span>
                <span v-else>{{ item3 }}</span>
              </p>
            </a-collapse-panel>
          </a-collapse>
          <div v-else>
            <p v-for="item1 in item.matched.slice(2)" @click="triggerShow(item)">{{ item1 }}</p>
          </div>
        </template>
      </a-collapse-panel>
    </a-collapse>
  </div>
</template>

<style scoped lang="less">
.search-container {
  width: 100%;
  height: 100%;
  padding-top: 20px;
  box-sizing: border-box;

  /deep/ .ant-collapse.wrapper {
    border: none;
    border-bottom: 1px solid #d9d9d9;

    .ant-collapse-item {
      border: none !important;

      .header-wrapper {
        display: flex;
        justify-content: space-between;
      }
      p {
        margin: 0;
        line-height: 25px;
        padding-left: 15px;
        padding-right: 15px;
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
        overflow: hidden;
        color: rgba(0, 0, 0, 0.65);
      }
      .item-wrapper {
        &:hover {
          background-color: rgb(235, 235, 235);
        }
      }
      .show-more {
        color: rgba(0, 0, 0, 0.4);
      }
    }
    > .ant-collapse-item {
      > .ant-collapse-content {
        > .ant-collapse-content-box {
          padding: 0;

        }
      }
    }
    .ant-collapse-content {
      border-top: none;
    }

    .ant-collapse-content-box {
      background: #fafafa;
    }
    .first-wrapper{
      width: 100%;
      box-sizing: border-box;
      padding-left: 16px;
      padding-right: 16px;
    }
  }
}
</style>
<script lang="ts">
import {defineComponent, ref,computed} from 'vue';
import {FileTextOutlined} from '@ant-design/icons-vue'
import {useStore} from "vuex";

export default defineComponent({
  name: 'SearchResult',
  props: {
    searchResult:{
      type:Array,
    },
    searchValue: String,
  },
  components: {FileTextOutlined},
  setup(props,context) {
    const activeKey = ref([]);
    const changeActivekey=(key: any)=>{
      console.log(key)
    }
    const addFlagresult =computed(()=>{
      if (props.searchResult !==undefined){
        return  props.searchResult.map((item: any)=>{
          item.collapseFlag =true;
          return item;
        })
      }else {
        return  []
      }
    })
    const store =useStore();
    const triggerShow=(item: any)=>{
      const selectObj ={
        activeFileName:item.filename,
        activeKey:item.key,
        activePath:item.path
      }
      store.commit('setActiveObj',selectObj);
    }
    return {
      activeKey,
      changeActivekey,
      triggerShow,
      addFlagresult,
    }
  }
});
</script>
