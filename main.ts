const  {app,BrowserWindow,ipcMain} =require('electron');
// 判断开发环境还是生产环境
const isDev =require('electron-is-dev');
const chokidar=require( 'chokidar');
import {basePath} from "./src/utils/config";

let mainWindow;
app.on('ready',()=>{
    mainWindow = new BrowserWindow({
        width:800,
        height:800,
        webPreferences:{
            nodeIntegration:true,
            enableRemoteModule: true
        }
    })
    const urlLocation =isDev?'http://localhost:8080/':'';
    mainWindow.loadURL(urlLocation);
    // 监听文件夹变化传递给渲染进程。
    chokidar.watch(basePath,{
        ignored: /(^|[\/\\])\../, // ignore dotfiles
    }).on('all',(eventName, path) =>{
        mainWindow.webContents.send('getFile','');
    })
})
