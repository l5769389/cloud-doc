<template >
  <div class="container">
    <textarea name="" rows="" cols="" id="editor"></textarea>
  </div>
</template>

<style scoped lang="less">
@import "~easymde/dist/easymde.min.css";
</style>
<script lang="js">
import {defineComponent, onMounted, watch, computed,nextTick} from 'vue';
import EasyMDE from "easymde";
import COS  from'cos-js-sdk-v5';
import {message} from 'ant-design-vue';

export default defineComponent({
   name: 'MDE',
  props:{
    activekey:{
      type:String,
      default(){
        return ''
      }
    },
    autofocus:Boolean,
    value:String,
  },
  setup(props,context){
   const key =computed(()=>props.activekey);
   const value=computed(()=>props.value);
    const {v4: uuidv4} = require('uuid');
   onMounted(()=>{
     const config =
         {
       autofocus:true,
       autosave: {
         enabled: true,
         uniqueId :key.value,
         delay: 1000,
         timeFormat: {
           locale: 'en-US',
           format: {
             year: 'numeric',
             month: 'long',
             day: '2-digit',
             hour: '2-digit',
             minute: '2-digit',
           },
         },
         text: "Autosaved: "
       },
       element: document.getElementById("editor"),
       indentWithTabs: false,
       insertTexts: {
         horizontalRule: ["", "\n\n-----\n\n"],
         image: ["![](http://", ")"],
         link: ["[", "](http://)"],
         table: ["", "\n\n| Column 1 | Column 2 | Column 3 |\n| -------- | -------- | -------- |\n| Text     | Text      | Text     |\n\n"],
       },
       lineWrapping: false,
       minHeight: "500px",
       uploadImage:true,
       imageUploadFunction:function (e,x){
         const cos = new COS({
           SecretId: 'AKIDe3Biji5EROBobHsrjMinmbASUJsI3QgP',
           SecretKey: 'dIgvRvGMDoHUEiEVWR5TXjeIkvr0tjhN'
         })
         const id  =uuidv4();
         cos.putObject({
           Bucket: 'markdown-1304442942', /* 必须 */
           Region: 'ap-shanghai',    /* 必须 */
           Key:id,              /* 必须 */
           StorageClass: 'STANDARD',
           Body: e, // 上传文件对象
           onProgress: function(progressData) {
             console.log(JSON.stringify(progressData));
           }
         },async function(err, data) {
           if (err){
             message.info('上传失败，请重试')
             throw err
           }
           if (data){
             message.info('上传成功');
            const url =`https://markdown-1304442942.cos.ap-shanghai.myqcloud.com/${id}`;
            editor.value(editor.value()+`![123](${url})`);
            editor.codemirror.focus();
           }
         });
       },
       parsingConfig: {
         allowAtxHeaderWithoutSpace: true,
         strikethrough: false,
         underscoresBreakWords: true,
       },
       placeholder: "Type here...",
       renderingConfig: {
         singleLineBreaks: false,
         codeSyntaxHighlighting: true,
       },
       previewImagesInEditor:false, //true 会导致闪烁
       shortcuts: {
         drawTable: "Cmd-Alt-T"
       },
       showIcons: ["code", "table"],
       spellChecker: false,
       styleSelectedText: false,
       sideBySideFullscreen: false,
       syncSideBySidePreviewScroll: false,
       tabSize: 4,
     }
        const editor= new EasyMDE(config);
        editor.codemirror.on('change',function (instance,changeObj){
          context.emit('update:modelValue',editor.value());
        })
     editor.codemirror.on('paste',function (instance,e){
       console.log(e);
       const items= e.clipboardData && e.clipboardData.items;
       let file =null;
       if (items && items.length){
         for (let i=0;i<items.length;i++){
           if (items[i].type.indexOf('image')!==-1){
             file =items[i].getAsFile();
             break;
           }
         }
       }
     })
        watch(()=>props.activekey,(value) => {
          console.log(value);
          config.autosave.uniqueId=value;
        })
        watch(()=>value.value,value1 => {
          editor.value(value1);
        })
   })
    return {
    }
  }
});
</script>
