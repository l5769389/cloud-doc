<template >
  <a-tooltip :placement="placement" >
      <template #title>
        <slot name="title1">1</slot>
      </template>
      <slot name="content1">1</slot>
  </a-tooltip>
</template>

<style scoped>

</style>
<script lang="ts">
import {  defineComponent  } from 'vue'; 
export default defineComponent({
   name: 'MyTooltip',
  props:{
    placement:{
      type:String
    }
  }
});
</script>
