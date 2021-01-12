const fs = window.require('fs');
const path =window.require('path');
import {basePath} from "@/utils/config";

export class fileHelper {
   basePath=basePath;
   readFile = async ()=>{
      let ans: any =[];
      async function rescur(path1: any,obj: any){
         const files =await fs.promises.readdir(path1);
         if (files.length ===0){
            return []
         }
         for (let i=0;i<files.length;i++){
            if (files[i].indexOf('.') ===0){
               continue;
            }
            const filePath =path.join(path1,files[i]);
            const stat = await fs.promises.stat(filePath);
            const isFold = stat.isDirectory();
            if (isFold){
               obj.push({
                  title:files[i],
                  key:stat.ino,
                  children:[],
                  isLeaf:false,
                  path:filePath,
               })
               await rescur(filePath+'/',obj[obj.length-1].children)
            }else {
               obj.push({
                  title:files[i],
                  path:filePath,
                  isLeaf:true,
                  key:stat.ino,
               })
            }
         }
      }
      await rescur(this.basePath,ans);
      return ans;
   }
   // 如果名字相同则覆盖。
   renameFile =(oldPath: any,newPath: any)=> {
      // 检查文件是否存在当前目录中。有e则不存在。
      try {
         fs.accessSync(newPath);
         return new Promise((resolve, reject) => {
            reject('文件名存在')
         })
      }catch (e){
         return fs.promises.rename(oldPath,newPath)
      }
   }
   createFile=(path: any)=>{
      try{
         fs.accessSync(path);
         return new Promise((resolve, reject) => {
            reject('文件名存在')
         })
      }catch (e) {
        return  fs.promises.writeFile(path,'','utf8')
      }
   }
   createDir=(path: any)=>{
      try{
         fs.accessSync(path); // 如果path文件不存在，就抛出error
         return new Promise((resolve, reject) => {
            reject('文件名存在')
         })
      }catch (e) {
         return  fs.promises.mkdir(path)
      }
   }
   unlinkFile=(path: any)=>{
      try{
         fs.accessSync(path);
         return  fs.promises.unlink(path)
      }catch (e) {
         return new Promise((resolve, reject) => {
            reject('文件名不存在')
         })
      }
   }
   rmdir= (pathDir: any)=>{
      try {
         function resur(pathDir: any){
            fs.accessSync(pathDir);
            const files = fs.readdirSync(pathDir);
            if (files.length ===0){
               return  fs.rmdirSync(pathDir);
            }
            for (let i=0;i<files.length;i++){
               const filePath =path.join(pathDir,files[i]);
               const stat =fs.statSync(filePath);
               const isFold =stat.isDirectory();
               if (isFold){
                  resur(filePath);
               }else {
                  fs.unlinkSync(filePath);
               }
            }
            return fs.rmdirSync(pathDir);
         }
         resur(pathDir);
         return {
            code:0,
            msg:'ok'
         }
      }
      catch (e){
         return {
            code:-1,
            msg:e.code
         }
      }
   }
}
