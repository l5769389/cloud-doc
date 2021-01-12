<template >
<div class="search-container" @mouseenter="searchFlag=true" @mouseleave="searchFlag=false" v-show="!inputStateFlag">
    <span></span>
    <span class="title">文件</span>
  <SearchOutlined class="icon" v-show="searchFlag" @click="inputStateFlag =true"/>
</div>
<div class="search-input-wrapper" v-show="inputStateFlag">
  <ArrowLeftOutlined @click="inputStateFlag = false" />
  <a-input-search
      v-model:value="value"
      placeholder="input search text"
      style="width: 200px"
      @search="onSearch"
  />
</div>

</template>

<style scoped lang="less">
  .search-container,.search-input-wrapper{
    width: 100%;
    height:25px;
    padding-left: 10px;
    padding-right: 10px;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    .icon{
      position: absolute;
      right: 20px;
      top: 50%;
      transform: translateY(-50%);
    }
  }
  .search-input-wrapper{
    >span:first-child{
      margin-right: 5px;
    }
  }
</style>
<script lang="ts">
import {  defineComponent ,ref } from 'vue';
import {SearchOutlined,ArrowLeftOutlined} from '@ant-design/icons-vue'
export default defineComponent({
   name: 'MenuHeader',
  components:{
     SearchOutlined,
    ArrowLeftOutlined
  },
  setup(){
     const searchFlag =ref(false);
     const inputStateFlag =ref(false);
     return{
       searchFlag,
       inputStateFlag,
     }
  }
});
</script>
