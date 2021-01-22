<template>
  <div class="foot-container" @mouseenter="showFlag=true" @mouseleave="showFlag=false">
    <div>
      <div v-show="showFlag">
        <my-tooltip placement="rightBottom">
          <template #title1>
            创建文件
          </template>
          <template #content1>
            <PlusOutlined class="icon" @click="createFile"/>
          </template>
        </my-tooltip>

      </div>
    </div>
    <div class="content-wrapper" @click="showDrawer">
      <span>{{recentList[0].filename}}</span>
      <MoreOutlined class="icon" v-show="showFlag"/>
    </div>
    <div>
      <div v-show="true">
        <my-tooltip placement="rightBottom">
          <template #title1>
            功能没开发
          </template>
          <template #content1>
            <HddOutlined class="icon" v-show="showFlag"/>
          </template>
        </my-tooltip>
      </div>
    </div>
  </div>
    <a-drawer
        v-show="visible"
        placement="bottom"
        :closable="false"
        :visible="true"
        :get-container="false"
        :wrap-style="{ position: 'absolute' }"
        :body-style="{padding:0,height:'100%'}"
        @close="onClose"
    >
      <div class="recent-container">
        <div class="header">
          <span>最近打开的文件夹</span>
        </div>
        <!--        <CloseCircleOutlined />-->
        <div class="list-wrapper">
          <div v-for="(item,index) in recentList" :key="item" @click="selectDir(item.path)">
            <my-tooltip placement="rightTop">
              <template #title1>
                {{item.path}}
              </template>
              <template #content1>
                <FolderOutlined/>
                <span>{{item.filename}}</span>
                <span v-if="index===0" class="active-item"></span>
              </template>
            </my-tooltip>
          </div>
        </div>
        <div class="footer">
          <div>
            <span>目录</span>
          </div>
          <span @click="chooseFile">打开文件夹...</span>
        </div>
      </div>
    </a-drawer>
</template>

<style scoped lang="less">
.foot-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-direction: row;
  box-sizing: border-box;
  > div {
    height: 100%;
    display: flex;
    align-items: center;
  }

  > div:first-child, > div:last-child {
    flex: 0 0 30px;
    position: relative;
    justify-content: center;
  }

  > div:first-child {
    &:hover {
      background-color: rgb(235, 235, 235);
    }

  }

  > div:last-child {
    &:hover {
      background-color: rgb(235, 235, 235);
    }

  }

  .content-wrapper {
    flex: 1;
    position: relative;

    &:hover {
      background-color: rgb(235, 235, 235);
    }

    > span:first-child {
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
      width: 100%;
      padding-right: 15px;
      box-sizing: border-box;
      text-align: center;
    }

    .icon {
      position: absolute;
      right: 0;
      top: 50%;
      transform: translateY(-50%);
      font-size: 18px;
      font-weight: bolder;
    }
  }
}

.recent-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  .header {
    width: 100%;
    flex: 0 0 35px;
    display: flex;
    padding: 0 10px;
    box-sizing: border-box;
    align-items: center;
  }
  .list-wrapper {
    width: 100%;
    flex: 1;
    display: flex;
    flex-direction: column;
    > div {
      width: 100%;
      height: 25px;
      display: flex;
      align-items: center;
      padding: 0 15px;
      box-sizing: border-box;
     >span:first-child{
       flex: 0 0 25px;
       >span:first-child{
         margin-right: 5px;
       }
       .active-item{
         display: inline-block;
         width: 10px;
         height: 10px;
         border-radius: 50%;
         background-color: rgb(53,119,190);
         position: absolute;
         right: 0;
         top: 50%;
         transform: translate(-50%,-50%);
       }
     }
      >span:last-child{
        flex: 1;
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
        overflow: hidden;
        position: relative;
      }
      &:hover {
        background-color: rgb(235, 235, 235);
        background-clip: border-box;
      }
    }
  }
  .footer{
    width: 100%;
    flex: 0 0 55px;
    display: flex;
    flex-direction: column;
    >div{
      font-size: 15px;
      border-top: 1px solid rgb(235,235,235);
      padding: 0 10px;
      box-sizing: border-box;
    }
    >span:last-child{
      width: 100%;
      padding: 0 15px;
      box-sizing: border-box;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
      &:hover {
        background-color: rgb(235, 235, 235);
        background-clip: border-box;
      }
    }
  }
}

</style>
<script lang="ts">
import {PlusOutlined, MoreOutlined, HddOutlined, CloseCircleOutlined, FolderOutlined} from '@ant-design/icons-vue'

import {defineComponent, ref} from 'vue';
import MyTooltip from "@/components/MyTooltip.vue";
import {fileHelper} from '@/utils/FileHelper.ts';
import {message} from "ant-design-vue";
export default defineComponent({
  name: 'MenuFooter',
  components: {
    MyTooltip,
    PlusOutlined,
    MoreOutlined,
    HddOutlined,
    CloseCircleOutlined,
    FolderOutlined
  },
  emits:['create-file'],
  setup(props,context) {
    const showFlag = ref(false);
    const visible = ref(false);
    const electron =window.require('electron');
    const {remote,ipcRenderer} =electron;
    const filehelper =new fileHelper();
    const recentList =ref();
    function showDrawer() {
      visible.value = true;
    }

    function onClose() {
      visible.value = false;
    }
    const chooseFile =()=>{
      const openDialog = async ()=>{
        const result =await remote.dialog.showOpenDialog({
          title:'test',
          properties:['openDirectory','createDirectory'],
          defaultPath:'/Users/ljun/Documents/'
        })
        filehelper.writeConfig(result.filePaths[0]);
      }
      openDialog();
    }
    ipcRenderer.on('change-local-path',(event: any,message: any)=>{
      selectDir(message);
    })
    const selectDir=(dir: any)=>{
      const state =filehelper.writeConfig(dir);
      if (state.code===-1){
        message.error(state.msg)
      }else {
        visible.value =false;
      }
    }

    const createFile=()=>{
      context.emit('create-file');
    };
    const Store = window.require('electron-store');
    const store = new Store();
    const list =store.get('recentDirList');
    if (list){
      recentList.value =covertList(list);
    }
    ipcRenderer.on('recentDir', (event:any, message: any) => {
       recentList.value =covertList(message);
    })
    function covertList(list: any){
     let mapArr: any =[];
      list.forEach((item: any)=>{
        const arr =item.split('/');
        const filename =arr[arr.length-1];
        mapArr.push({
          filename:filename,
          path:item
        })
      })
      let arr =mapArr.reverse();
      return arr;
    }
    return {
      showFlag,
      showDrawer,
      onClose,
      visible,
      chooseFile,
      createFile,
      recentList,
      selectDir,
    }
  }
});
</script>
