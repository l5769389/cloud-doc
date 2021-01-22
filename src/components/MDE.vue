<template >
  <div class="mde-container">
    <textarea name="" rows="" cols="" id="editor"></textarea>
  </div>
</template>

<style scoped lang="less">
@import "~easymde/dist/easymde.min.css";
.mde-container{
  width: 100%;
  height: 100%;
  flex: 1;
  position: relative;
  overflow: scroll;
  /deep/ .EasyMDEContainer{
    position: relative;
    height: 100%;
    .editor-toolbar{
      border: none!important;
      background-color: rgb(246,246,246);
    }
    /deep/ .CodeMirror-wrap,.editor-preview-side{
      border-top: 0;
      height: calc(100% - 82px);
    }
  }
}
</style>
<script lang="js">
import {defineComponent, onMounted, watch, computed,nextTick,ref} from 'vue';
import EasyMDE from "easymde";
import {message} from 'ant-design-vue';
import {useStore} from "vuex";
import {fileHelper} from '@/utils/FileHelper.ts';
import {uploadImg,uploadFile,uploadAllFile} from "@/utils/COS";

export default defineComponent({
   name: 'MDE',
  setup(props,context){
    const store =useStore();
    let content=ref('');
    const activeKey=computed(()=>store.getters.getActiveObj.activeKey);
    const activePath=computed(()=>store.getters.getActiveObj.activePath);
    const filehelper =new fileHelper();
    const { remote, ipcRenderer } = window.require('electron')
    const {FindInPage} =require('electron-find');
    let findInPage = new FindInPage(remote.getCurrentWebContents(), {
      preload: true,
      offsetTop: 6,
      offsetRight: 10
    })
    ipcRenderer.on('on-find', (e, args) => {
      findInPage.openFindWindow()
    })
    onMounted(()=>{
       init();
   })
    //初始时 尝试读取文件内容作为初始化md中的内容。
    // 编辑时 修改内存的变量。 定时进行保存。
    function init(){
      const hljs = require('highlight.js');
      const md = window.require('markdown-it')(
          {
            highlight: function (str, lang) {
              if (lang && hljs.getLanguage(lang)) {
                try {
                  return hljs.highlight(lang, str).value;
                } catch (__) {}
              }

              return ''; // use external default escaping
            }
          }
      )
       .use(require('markdown-it-imsize'))
       .use(require('markdown-it-footnote'))
      const config = {
        autofocus:true,
        element: document.getElementById("editor"),
        minHeight: "500px",
        uploadImage:true,
        status: ["lines", "cursor",'words'], // Another optional usage, with a custom status bar item that counts keystrokes
        imageUploadFunction:function (e,x){
         const result = uploadImg(editor,e);
        result.then(data=>{
          editor.value(editor.value()+`![123](${url})`);
          editor.codemirror.focus();
        })
          .catch(err=>{
            if (err.code ===-1){
              message.info('请先填写COS信息');
              setTimeout(()=>{
                ipcRenderer.send('setting');
              },500)
            }
            if (err.code===-2){
              message.info('上传失败，请重试');
              message.info('请检查COS信息');
              setTimeout(()=>{
                  ipcRenderer.send('setting');
              },500)
            }
          })
        },
        placeholder: "Type here...",
        styleSelectedText: false,
        sideBySideFullscreen: false,
        previewRender: function(plainText) {
            return md.render(plainText);
        }
      }
      const editor= new EasyMDE(config);
      editor.codemirror.on('change',function (instance,changeObj){
        content.value =editor.value();
      })
      editor.codemirror.on('paste',function (instance,e){
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
      watch(()=>activeKey.value,value => {
          getContent();
      })
      autoSave();
      const getContent =()=>{
        const result =  filehelper.readFileContent(activePath.value);
        if (result.code ===0){
          editor.value(result.content)
        }else {
          message.error('出错了')
        }
      }
    }

    const autoSave=()=>{
      watch(()=>content.value,value => {
      const timer= setTimeout(()=>{
          const result =filehelper.writeFile(activePath.value,value);
        },500)
      })
    }
    ipcRenderer.on('upload-file',()=>{
      if (activeKey.value){
      const result =  uploadFile(content.value)
        result.then(data=>{
          message.success('上传成功')
        })
            .catch(err=>{
              if (err.code ===-1){
                message.info('请先填写COS信息');
                setTimeout(()=>{
                  ipcRenderer.send('setting');
                },500)
              }
              if (err.code===-2){
                message.info('上传失败，请重试');
                message.info('请检查COS信息');
                setTimeout(()=>{
                  ipcRenderer.send('setting');
                },500)
              }
            })
      }
    })
    ipcRenderer.on('upload-dir',()=>{
      uploadAllFile();
    })
    return {
    }
  }
});
</script>
