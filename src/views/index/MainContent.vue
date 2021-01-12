<template>
  <MDE  :activekey="activekey" :autofocus="autoFocus" :value="nowValue" v-model="value" ref="mdeRef"></MDE>
</template>

<style scoped>

</style>
<script lang="ts">
import {computed, defineComponent, ref, watch} from 'vue';
import MDE from "@/components/MDE.vue";
export default defineComponent({
  name: 'MainContent.vue',
  components:{
    MDE
  },
  props:{
    activekey:String,
  },
  setup(props,context){
    const value =ref(''); //只用来获取子组件值。
    const nowValue =ref('');//设置子组件值
    const autoFocus = ref(false);
    watch(()=>props.activekey,(value1,preVal) => {
     const content = localStorage.getItem(`smde_${value1}`);
     if (content){
       nowValue.value =content;
     }else {
       nowValue.value='';
     }
    })
    return{
      autoFocus,

      value,
      nowValue,
    }
  }
});
</script>
