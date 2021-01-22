<template>
  <div class="container">
    <div class="header" v-if="fileName">{{fileName}}</div>
    <MDE ref="mdeRef"></MDE>
  </div>
</template>

<style scoped lang="less">
.container{
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  .header{
    flex: 0 0 24px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 15px;
    color: rgb(182,182,182);
    font-weight: 500;
  }
}
</style>
<script lang="ts">
import {computed, defineComponent, ref, watch} from 'vue';
import MDE from "@/components/MDE.vue";
import {useStore} from "vuex";
export default defineComponent({
  name: 'MainContent.vue',
  components:{
    MDE
  },
  setup(props,context){
    const store = useStore();
    const fileName =computed(()=>store.getters.getActiveObj.activeFileName);

    return{
      fileName,
    }
  }
});
</script>
