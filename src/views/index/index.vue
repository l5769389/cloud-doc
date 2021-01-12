<template>
  <div class="outer-container">
      <div class="left">
          <Menu v-model="activekey"></Menu>
      </div>
      <div class="right">
        <main-content :activekey="activekey"></main-content>
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
    }
    .right{
      flex: 1;
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
     const activekey =ref();
     return{
       activekey,
     }
  }
});
</script>
