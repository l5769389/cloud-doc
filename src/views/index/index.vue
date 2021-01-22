<template>
  <div class="outer-container">
      <div class="left">
          <Menu></Menu>
      </div>
      <div class="right">
        <main-content ></main-content>
      </div>
  </div>
</template>

<style scoped lang="less">
  .outer-container{
    width: 100%;
    height: 100%;
    display: flex;
    .left{
      flex: 0 0 240px;
      height: 100%;
      position: relative;
      order: 0;
    }
    .right{
      flex: 1;
      height: 100%;
      order: 1;
    }
  }
</style>
<script lang="ts">
import {defineComponent, ref} from 'vue';
import Menu from "@/views/index/Menu.vue";
import MainContent from './MainContent.vue'
export default defineComponent({
   name: 'index',
   components: {MainContent, Menu},
  setup(){

     return{

     }
  }
});
</script>
