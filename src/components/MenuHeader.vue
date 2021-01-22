<template>
  <div class="search-container" @mouseenter="showFlag=true" @mouseleave="showFlag=false" v-show="!inputStateFlag">
    <div>
      <div v-show="showFlag">
        <my-tooltip placement="rightBottom">
          <template #title1>
            功能没开发
          </template>
          <template #content1>
            <BarsOutlined/>
          </template>
        </my-tooltip>
      </div>
    </div>
    <span class="title">文件</span>
    <div>
      <div v-show="showFlag">
        <my-tooltip placement="leftBottom">
          <template #title1>
            搜索
          </template>
          <template #content1>
            <SearchOutlined class="icon"  @click="inputStateFlag =true"/>
          </template>
        </my-tooltip>
      </div>

    </div>
  </div>
  <div class="search-input-wrapper" v-show="inputStateFlag">
    <ArrowLeftOutlined @click="onCancelSearch"/>
    <a-input-search
        v-model:value="inputVal"
        placeholder="查找"
        style="width: 200px"
        @search="onSearch"
    />
  </div>
</template>

<style scoped lang="less">
.search-container, .search-input-wrapper {
  width: 100%;
  height: 25px;
  padding-left: 10px;
  padding-right: 10px;
  position: relative;
  display: flex;
  align-items: center;
  box-sizing: border-box;
}
.search-container{
  justify-content: space-between;
}

.search-input-wrapper {
  justify-content: center;
  > span:first-child {
    margin-right: 5px;
  }
}
</style>
<script lang="ts">
import {defineComponent, ref} from 'vue';
import {SearchOutlined, ArrowLeftOutlined, BarsOutlined} from '@ant-design/icons-vue'
import MyTooltip from "@/components/MyTooltip.vue";
export default defineComponent({
  name: 'MenuHeader',
  components: {
    SearchOutlined,
    ArrowLeftOutlined,
    BarsOutlined,
    MyTooltip,
  },
  emits:['search-value','cancel-search'],
  setup(props,context) {
    const showFlag = ref(false);
    const inputStateFlag = ref(false);
    const inputVal =ref('');
    const electron =window.require('electron');
    const {remote,ipcRenderer} =electron;
    const onSearch =()=>{
         context.emit('search-value',inputVal.value);
    }
    const onCancelSearch=()=>{
      inputStateFlag.value = false;
      context.emit('cancel-search')

    }
    return {
      showFlag,
      inputStateFlag,
      onSearch,
      onCancelSearch,
      inputVal,
    }
  }
});
</script>
