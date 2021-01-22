const {app, BrowserWindow, ipcMain, webContents, globalShortcut, Menu} = require('electron');
// 判断开发环境还是生产环境
const isDev = require('electron-is-dev');
const chokidar = require('chokidar');
const fs = require('fs');
const path = require('path');
const configPath = '/Users/ljun/WebstormProjects/cloud-doc/src/utils/config';
let basePath = '';
try {
    fs.accessSync(configPath)
    basePath = fs.readFileSync(configPath, 'utf8');
} catch (e) {
    console.log(e);
}
const Store = require('electron-store');
const store = new Store();
const RECENTLIST_LENGTH = 7;

handlerMenu();
let mainWindow;
let setWin;
app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true
        }
    })
    const urlLocation = isDev ? 'http://localhost:8080/' : '';
    mainWindow.loadURL(urlLocation);

    addListen();
    ipcMain.on('new-file', () => {
        mainWindow.webContents.send('new-file', '');
    })
    ipcMain.on('new-dir', () => {
        mainWindow.webContents.send('new-dir', '');
    })

    ipcMain.on('setting', () => {
        setWin = new BrowserWindow({
            width: 600,
            height: 500,
            parent: mainWindow,
            resizable: false,
            webPreferences: {
                nodeIntegration: true,
                enableRemoteModule: true
            }
        })
        const urlLocation = `file://${path.join(__dirname, './setting/setting.html')}`;
        setWin.loadURL(urlLocation);
    })
    ipcMain.on('cloud-info-ok', (event, message) => {
        setTimeout(()=>{
            handlerMenu();
        },200)
        setCloudInfo(message)
    })
    ipcMain.on('choose-cloud-path', (event, message) => {
        setTimeout(()=>{
            handlerMenu();
        },200)
        store.set('localPath', message);
        //修改menufooter中打开的文件夹
        mainWindow.webContents.send('change-local-path', message);
    })

    ipcMain.on('upload-file',(event,message)=>{
        mainWindow.send('upload-file');
    })

    ipcMain.on('upload-dir',(event,message)=>{
        mainWindow.send('upload-dir');
    })
    mainWindow.on('focus', () => {
        globalShortcut.register('CommandOrControl+F', function () {
            if (mainWindow && mainWindow.webContents) {
                mainWindow.webContents.send('on-find', '')
            }
        })
    })
    mainWindow.on('blur', () => {
        globalShortcut.unregister('CommandOrControl+F')
    })

    function addListen() {
        // 监听文件夹变化传递给渲染进程。
        chokidar.watch(configPath, {
            ignored: /(^|[\/\\])\../, // ignore dotfiles
        })
            .on('change', () => {
                const recentList = setStore();
                mainWindow.webContents.send('getFile', '');
                mainWindow.webContents.send('recentDir', recentList);
            })
        chokidar.watch(basePath, {
            ignored: /(^|[\/\\])\../, // ignore dotfiles
        })
            .on('add', () => {
                mainWindow.webContents.send('getFile', '');
            })
            .on('addDir', () => {
                mainWindow.webContents.send('getFile', '');
            })
            .on('unlink', () => {
                mainWindow.webContents.send('getFile', '');
            })
            .on('unlinkDir', () => {
                mainWindow.webContents.send('getFile', '');
            })
    }

    function setStore() {
        console.log(store.path);
        try {
            fs.accessSync(configPath)
            const dir = fs.readFileSync(configPath, 'utf8');
            let recentList = store.get('recentDirList');
            console.log(recentList);
            if (recentList === undefined) {
                recentList = [];
                recentList.push(dir)
            } else {
                const index = recentList.indexOf(dir);
                if (recentList.length < RECENTLIST_LENGTH) {
                    if (index === -1) {
                        recentList.push(dir);
                    } else {
                        recentList.splice(index, 1);
                        recentList.push(dir);
                    }
                } else {
                    if (index === -1) {
                        recentList.shift();
                        recentList.push(dir)
                    } else {
                        recentList.splice(index, 1);
                        recentList.push(dir);
                    }
                }
            }
            store.set('recentDirList', recentList);
            return recentList;
        } catch (e) {
            console.log(e)
        }
    }

    function setCloudInfo(cloudObj) {
        store.set('cloudObj', cloudObj);
    }
})

function handlerMenu() {
    const menuTemplate = require('./menu');

    function handleMenu(template) {
        const cloudSetting = store.get('cloudObj');
        let cloudSettingFlag = false;
        if (cloudSetting) {
            const result = Object.values(cloudSetting).every(item => item !== '');
            cloudSettingFlag = result;
        }
        console.log(cloudSettingFlag);
        const localPath = store.get('localPath');
        if (cloudSettingFlag && localPath) {
            template[4].submenu.forEach(item => {
                item.enabled = true;
            })
        } else {
            template[4].submenu.forEach(item => {
                item.enabled = false;
            })
        }
        return template;
    }

    const menuafter = handleMenu(menuTemplate);
    const menu = Menu.buildFromTemplate(menuafter);
    Menu.setApplicationMenu(menu)
}