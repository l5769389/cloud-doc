<template >
  <div class="container" >
    <div class="header">
      <menu-header @search-value="onSearch" @cancel-search="onCancelSearch"></menu-header>
    </div>
    <div class="content" ref="containerRef">
      <search-result v-if="searchFlag" :searchResult="searchResult" :searchValue="searchValue"></search-result>
      <div ref="menuRef"  v-else-if="treeData.length">
        <div>
          <a-directory-tree
              :tree-data="treeData"
              @select="onSelect"
              @expand="onExpand"
              :defaultSelectedKeys="defaultSelectedKeys"
              @rightClick="onRightClick"
          >
            <template #title="{ title }">
               <span v-if="title.indexOf(searchValue) > -1">
                {{ title.substr(0, title.indexOf(searchValue)) }}
                <span style="color: #f50">{{ searchValue }}</span>
              {{ title.substr(title.indexOf(searchValue) + searchValue.length) }}
        </span>
              <span v-else>{{ title }}</span>
            </template>

          </a-directory-tree>
        </div>

      </div>
      <div v-else class="no-file" @mouseenter="showNofileFlag=true" @mouseleave="showNofileFlag=false">
        <span v-show="showNofileFlag">没有打开的文件夹</span>
      </div>
    </div>
    <div class="footer">
      <menu-footer @create-file="createFile"></menu-footer>
    </div>
    <a-modal
        :title=modalState.title
        v-model:visible="modalState.visible"
        :confirm-loading="modalState.confirmLoading"
        @ok="handleOk"
    >
      <a-input :suffix="modalState.suffix" v-model:value="inputVal"  ref="InputRef"/>
    </a-modal>
  </div>
</template>
<style scoped lang="less">
 .container{
   width: 100%;
   height: 100%;
   display: flex;
   flex-direction: column;
   background-color: rgb(248,248,248);
   padding-top: 10px;
   box-sizing: border-box;
   position: relative;
   overflow: hidden;
   /deep/ li{
     border: 1px transparent solid;
   }
   /deep/ .active{
     border: 1px gray dashed;
   }
   .header{
     flex:0 0 25px;
     order: 0;
   }
   .content{
     flex: 1;
     overflow: scroll;
     order: 1;
   }
   .footer{
     flex:0 0 31px;
     border-top: 1px solid rgb(229,229,229);
     order: 2;
   }
   .no-file{
     width: 100%;
     height: 100%;
     display: flex;
     justify-content: center;
     align-items: center;
   }
 }
</style>
<style>
</style>
<script lang="ts">
import {defineComponent, ref, onMounted, nextTick, watch, reactive, createVNode, computed} from 'vue';
import MenuHeader from "@/components/MenuHeader.vue";
import {FolderFilled,FileTextOutlined, ExclamationCircleOutlined} from '@ant-design/icons-vue'
import {fileHelper} from '@/utils/FileHelper.ts';
import { message,Modal } from 'ant-design-vue';
import {useStore} from "vuex";
import MenuFooter from "@/views/index/MenuFooter.vue";
import SearchResult from "@/views/index/SearchResult.vue";
export default defineComponent({
  name: 'Menu',
  components: {SearchResult, MenuFooter, MenuHeader,FolderFilled,FileTextOutlined,message,Modal},
  setup(props,context){
    const treeData: any =ref([]);
    const filehelper: any = new fileHelper();
    const menuRef=ref();
    const modalState =reactive({
       title:'',
       visible:false,
       confirmLoading:false,
       suffix:'',
    })
    const inputVal =ref('');
    const InputRef=ref();
    const containerRef =ref();
    let selectedKey: any;
    const selectedKeys=ref();
    const defaultSelectedKeys: any =ref([]);
    let flattenTreeData: any;
    const electron =window.require('electron');
    const {remote,ipcRenderer} =electron;
    const {Menu,MenuItem} =remote;
    let rightScopeFlag:any =false;
    let rightClickKey:any;
    // 是获取上下文菜单时的li元素获取情况。
    let result :any;
    // arr is menu arr, showDom is area to show the menu
    // menu结构分为文件列表showDom+左边空白区域
    let showDom: any;
    let containerDom: any;
    const store =useStore();
    const showNofileFlag =ref(false);
    const listMenuArr =[
      new MenuItem({
        label:'打开',
        click:()=>{
        }
      }),
      new MenuItem({
        label:'重命名',
        click:()=>{
          // 重命名 包括：1.双击重命名 2.右键重命名。
          modalState.visible=true;
          showRenameModal(rightClickKey);
        }
      }),
      new MenuItem({
        label:'删除',
        click:()=>{
          unlinkFileOrDir();
        }
      }),
    ]
    const blankMenuArr=[
      new MenuItem({
        label:'新建文档',
        click:()=>{
          createFile()
        }
      }),
      new MenuItem({
        label:'新建文件夹',
        click:()=>{
          createDir();
        }
      })
    ]
    const _ =require('lodash');

    const setRenderListen =()=>{
      ipcRenderer.on('getFile', (event:any, message: any) => {
        const handler = setTimeout(()=>{
          updateFileName();
          if (handler){
            clearTimeout(handler);
          }
        },500)
      })
      ipcRenderer.on('new-file',()=>{
        createFile();
      })
      ipcRenderer.on('new-dir',()=>{
        createDir();
      })
    }

    // get filelist
    const updateFileName =_.throttle(async ()=>{
      console.log('trigger');
      const ans =  await filehelper.readFile();
      treeData.value =ans;
      showDom=menuRef.value;
      //将ans扁平化处理
      flattenTreeData =flatten(ans);
    },1000)

    const init=()=>{
      setRenderListen();
      updateFileName();
      nextTick(()=>{
        containerDom=containerRef.value;
        useContextmenu(listMenuArr);
      })
    }
    init();
    //dbclick or right tap trigger


    // create file/ dir code
    let createPath: any;
    const createFile =()=>{
      //新建文件时，要判断：1.如果点在menu上 1.1是目录：则新建就在该目录基础上
      // 1.2如果是文件 那么就在同级新建。
      // 2 如果不在menu上 那么就在根目录下直接新建。 通过rightClickKey && rightScopeFlag 判断是否点击了menu.
      modalState.title=`创建文件`;
      modalState.visible=true;
      modalState.suffix=`.md`;
      inputVal.value=`Untitled`;
      nextTick(()=>{
        InputRef.value.focus();
      })
      // 有key表示 点击的可能是menu区域，但可能是之前值。加上flag确认。
      if (rightClickKey && rightScopeFlag){
        const clickObj =flattenTreeData.filter((item: any)=>item.key===rightClickKey)[0];
        if(clickObj.isLeaf){
          createPath = clickObj.path.split('/').slice(0,-1).join('/');
        }else {
          createPath = clickObj.path;
        }
      }else {
        createPath =filehelper.getbasePath();
      }
    }
    const handleCreateFile=()=>{
      modalState.confirmLoading =true;
      const newPath = `${createPath}/${inputVal.value+modalState.suffix}`;
      const result = filehelper.createFile(newPath);
      result.then((res:any)=>{
        message.success('创建成功!')
        updateFileName();
      })
          .catch((err: any)=>{
            console.log(err);
            message.error(err);
          })
          .finally(()=>{
            modalState.confirmLoading =false;
            modalState.visible =false;
          })
    }
    const createDir=()=>{
      modalState.title=`创建文件夹`;
      modalState.visible=true;
      modalState.suffix=``;
      inputVal.value=`Untitled`;
      nextTick(()=>{
        InputRef.value.focus();
      })
      if (rightClickKey && rightScopeFlag){
        const clickObj =flattenTreeData.filter((item: any)=>item.key===rightClickKey)[0];
        if(clickObj.isLeaf){
          createPath = clickObj.path.split('/').slice(0,-1).join('/');
        }else {
          createPath = clickObj.path;
        }
      }else {
        createPath =filehelper.getbasePath();
      }
    }
    const handleCreateDir=()=>{
      modalState.confirmLoading =true;
      const newPath = `${createPath}/${inputVal.value+modalState.suffix}`;
      const result = filehelper.createDir(newPath);
      result.then((res:any)=>{
        message.success('创建成功!')
        updateFileName();
      })
          .catch((err: any)=>{
            console.log(err);
            message.error(err);
          })
          .finally(()=>{
            modalState.confirmLoading =false;
            modalState.visible =false;
          })
    };
    // unlink file
    const  unlinkFileOrDir=()=>{
      const clickObj =flattenTreeData.filter((item: any)=>item.key===rightClickKey)[0];
      const path =clickObj.path;
      const isLeaf =clickObj.isLeaf;
      if (isLeaf){
        Modal.confirm({
          title: '确定要删除该文件么？',
          icon: createVNode(ExclamationCircleOutlined),
          content: 'When clicked the OK button, this dialog will be closed after 1 second',
          onOk() {
            const result = filehelper.unlinkFile(path);
            result.then((res:any)=>{
              message.success('删除成功!')
              updateFileName();
              return new Promise(resolve => {
                resolve();
              })
            })
                .catch((err: any)=>{
                  console.log(err);
                  message.error(`${err.code},删除失败!`);
                  return new Promise((resolve, reject)=>{
                    reject(err);
                  })
                })

          },
          onCancel() {},
        });
      }else {
        Modal.confirm({
          title: '确定要删除该文件夹么？',
          icon: createVNode(ExclamationCircleOutlined),
          content: 'When clicked the OK button, this dialog will be closed after 1 second',
          onOk() {
            const result = filehelper.rmdir(path);
            if (result.code ===0){
              message.success('删除成功!')
              updateFileName();
              return new Promise(resolve => {
                resolve();
              })
            }else {
              message.error(`${result.msg},删除失败!`);
              return new Promise((resolve, reject)=>{
                reject();
              })
            }
          },
          onCancel() {},
        });
      }
    }
    // rename code
    let preName:any;
    const showRenameModal =(key: any)=>{
      const selectObj =flattenTreeData.filter((item: any)=>item.key===key)[0];
        preName = selectObj.title;
        const isLeaf =selectObj.isLeaf;
        if (isLeaf){
          modalState.suffix =`.md`;
          inputVal.value = preName.substr(0,preName.length-3);
        }else {
          modalState.suffix =``;
          inputVal.value = preName;
        }
          modalState.title='重命名';
          modalState.visible =true;
          nextTick(()=>{
            InputRef.value.focus();
          })
    }
    const handleRename =()=>{
      if (preName ===inputVal.value+modalState.suffix){
        modalState.visible=false
      }else {
        modalState.confirmLoading =true;
        const oldPath =flattenTreeData.filter((item: any)=>item.key===selectedKey)[0].path;
        const newPath = `${oldPath.split('/').slice(0,-1).join('/')}/${inputVal.value+modalState.suffix}`;
        console.log(oldPath);
        console.log(newPath);
        const result = filehelper.renameFile(oldPath,newPath);
        result.then((res:any)=>{
          message.success('修改成功！')
          updateFileName();
        })
            .catch((err: any)=>{
              console.log(err);
              message.error(err);
            })
            .finally(()=>{
              modalState.confirmLoading =false;
              modalState.visible =false;
            })
      }
    }

    // common methods
    const getParentDom: any=(source: any)=>{
      if (source.classList.contains('ant-tree')){
        return  null
      }
      if (source.tagName==='LI'){
        return source;
      }
      return  getParentDom(source.parentNode);
    }
    const useContextmenu =(arr: any)=>{
      const menu = new Menu();
      arr.forEach((item: any)=>{
        menu.append(item)
      })
      const blankMenu =new Menu();
      blankMenuArr.forEach((item: any)=>{
        blankMenu.append(item);
        menu.append(item);
      })
      showDom =menuRef.value;
      containerDom.addEventListener('contextmenu',(e:any)=>{
        // 判断点击区域，如果超出了左侧则不显示，然后分为：1.在左侧上面菜单部分 2.左侧非菜单部分
        if (containerDom.contains(e.target)===false){
          return;
        }
        if (menuRef.value && menuRef.value.contains(e.target)){
          rightScopeFlag =true;
          result = getParentDom(e.target);
          if (result){
            removeClass(result);
            result.classList.add('active');
          }
          menu.popup({
            window:remote.getCurrentWindow()
          })
        }else {
          rightScopeFlag =false;
          blankMenu.popup({
            window:remote.getCurrentWindow()
          })
        }
      })
      containerDom.addEventListener('click',(e:any)=>{
        if (result){
          removeClass(result);
        }
      })
      containerDom.addEventListener('dblclick',(e: any)=>{
        if (menuRef.value && menuRef.value.contains(e.target)){
          showRenameModal(selectedKey);
        }
      })
      const removeClass=(result: any)=>{
        let parentNode =result.parentNode;
        if (parentNode ===null){
          return;
        }
        for (let i=0;i<parentNode.children.length;i++){
          parentNode.children[i].classList.remove('active');
        }
      }
    }
    // 嵌套数组扁平化。
    // 注意到扁平化情况下, title 和key并不是一一对应的。有可能在其他路径下出现同名title
    function flatten(arr: any){
      return arr.reduce(function (ans1: any,{title,key,path,isLeaf,children=[]}:any){
        return ans1.concat([{title,key,path,isLeaf}],flatten(children))
      },[])
    }

   // ui-component methods
   function onSelect(keys: any, event: any) {
      selectedKey =keys[0];
      defaultSelectedKeys.value=[selectedKey];
      syncStore();
    }
    function syncStore(){
      const selectObj =flattenTreeData.filter((item: any)=>item.key===selectedKey)[0];
      if (selectObj.isLeaf){
          store.commit('setActiveObj',{
            activeFileName:selectObj.title,
            activeKey:selectObj.key,
            activePath:selectObj.path,
          })
      }
    }

   function onExpand(keys: any,obj: any) {
      console.log(keys);
    }

   const handleOk=(e: any)=>{
      switch (modalState.title){
        case `重命名`:
          handleRename();
          break;
        case `创建文件`:
          handleCreateFile();
          break;
        case `创建文件夹`:
          handleCreateDir();
          break;
          default:
            break;
      }
    }
   const onRightClick=({event,node}: any)=>{
     selectedKey =node.eventKey;
    //如果点击位置是在tree结构上才会有key，否则清除key。
    rightClickKey = node.eventKey;
    console.log(rightClickKey);
    rightScopeFlag =true;
   }
   const searchValue =ref('');
   const searchFlag =ref(false);
   const searchResult=ref('');
   const onSearch =(args: any)=>{
      if (args.trim() !==''){
        searchFlag.value =true;
        searchValue.value =args;
        searchResult.value =  filehelper.matchSearch(args);
        console.log(searchResult.value);
      }else {
        searchFlag.value =false;
      }
   }
   const onCancelSearch=()=>{
     searchFlag.value =false;
     searchValue.value='';
   }
     return{
       onExpand,
       onSelect,
       treeData,
       selectedKeys,
       menuRef,
       containerRef,
       inputVal,
       modalState,
       handleOk,
       InputRef,
       defaultSelectedKeys,
       onRightClick,
       showNofileFlag,
       createFile,
       onSearch,
       searchValue,
       searchFlag,
       searchResult,
       onCancelSearch,
     }
  }
});
</script>
