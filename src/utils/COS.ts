import {message} from "ant-design-vue";
const {v4: uuidv4} = require('uuid');
const Store = window.require('electron-store');
// @ts-ignore
import COS from 'cos-js-sdk-v5';
import {fileHelper} from '@/utils/FileHelper.ts';
const { remote, ipcRenderer } = window.require('electron')
const store =new Store();
export function uploadImg(editor: any, e: any){
    // get info  check  upload
    const obj = store.get('cloudObj');
    if (obj == null || undefined){
        return  new Promise((resolve, reject) => {
            reject({
                code:-1,
                msg:'没有填写COS信息'
            })
        })
    }
    return new Promise((resolve, reject) => {
            const {SecretId,SecretKey,Bucket,Region}=obj;
            const cos = new COS({
                SecretId: SecretId,
                SecretKey: SecretKey
            })
            const id  =uuidv4();
            cos.putObject({
                Bucket: Bucket, /* 必须 */
                Region: Region,    /* 必须 */
                Key:`/imgs/${id}`,              /* 必须 */
                StorageClass: 'STANDARD',
                Body: e, // 上传文件对象
                onProgress: function(progressData: any) {
                    console.log(JSON.stringify(progressData));
                }
            },function(err: any, data: any) {
                if (err){
                    reject({
                        code:-2,
                        msg:'上传失败，请重试'
                    })
                }
                if (data){
                    resolve({
                        code:0,
                        msg:'上传成功',
                        url:`https://${Bucket}.cos.${Region}.myqcloud.com/imgs/${id}`,
                    })
                }
            });
    })
}

//
export function uploadFile(content: any,isLeaf =true,filePath=''){
    console.log('a');
    const obj = store.get('cloudObj');
    if (obj == null || undefined){
        return  new Promise((resolve, reject) => {
            reject({
                code:-1,
                msg:'没有填写COS信息'
            })
        })
    }
    return new Promise((resolve, reject) => {
        const {SecretId, SecretKey, Bucket, Region} = obj;
        const cos = new COS({
            SecretId: SecretId,
            SecretKey: SecretKey
        })
        const id = uuidv4();
        let uploadObj;
        if (isLeaf){
             uploadObj ={
                Bucket: Bucket, /* 必须 */
                Region: Region,    /* 必须 */
                Key: `/md/${filePath}${id}`,              /* 必须 */
                StorageClass: 'STANDARD',
                Body: content, // 上传文件对象
                onProgress: function(progressData: any) {
                     console.log(JSON.stringify(progressData));
                 }
            }
        }else {
            uploadObj ={
                Bucket: Bucket, /* 必须 */
                Region: Region,    /* 必须 */
                Key: `/md/${filePath}`,              /* 必须 */
                StorageClass: 'STANDARD',
                Body: '',
                onProgress: function(progressData: any) {
                    console.log(JSON.stringify(progressData));
                }
            }
        }
        cos.putObject(uploadObj, function (err: any, data: any) {
            if (err) {
                reject({
                    code: -2,
                    msg: '上传失败，请重试'
                })
            }
            if (data) {
                resolve({
                    code: 0,
                    msg: '上传成功',
                })
            }
        });
    })
}


export function uploadAllFile(){
    // const localPath =store.get('localPath');
    // const filehelper =new fileHelper();
    uploadFile('',false,'a/b/c');
}