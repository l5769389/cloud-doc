const fs = window.require('fs');
const path =window.require('path');

export class fileHelper {
   configPath='/Users/ljun/WebstormProjects/cloud-doc/src/utils/config';

   readFile = async ()=>{
      let basePath=this.getbasePath();
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
              if (path.extname(files[i]) ==='.md'){
                 obj.push({
                    title:files[i],
                    path:filePath,
                    isLeaf:true,
                    key:stat.ino,
                 })
              }
            }
         }
      }
      await rescur(basePath,ans);
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
   readFileContent=(filePath:any)=>{
      try{
         fs.accessSync(filePath);
         const content = fs.readFileSync(filePath,'utf8');
         return {
            code:0,
            content,
         }
      }catch (e) {
         return {
            code:-1,
            msg:e.code
         }
      }
   }
   writeFile=(filePath: any,data: any)=>{
      try{
         fs.accessSync(filePath);
         fs.writeFileSync(filePath,data)
      }catch (e) {
         return {
            code:-1,
            msg:e.code
         }
      }
   }
   writeConfig=(content: any)=>{
      let newContent =`${content}`
     try{
        fs.accessSync(this.configPath);
        fs.writeFileSync(this.configPath,newContent)
        return {
           code:0,
           msg: 'ok',
        }
     }catch (e) {
        return {
           code:-1,
           msg:e.code
        }
     }
   }
   getbasePath=()=>{
      let basePath;
      try{
         fs.accessSync(this.configPath)
         basePath = fs.readFileSync(this.configPath,'utf8');
         return basePath
      }catch (e) {
         console.log(e);
      }
   }
   matchSearch=(string: any)=>{
      const fileName: any =this.getbasePath()+`/`;
     const reg = new RegExp(`.{5}${string}.{5}`,'g');
     const regName = new RegExp(`${string}`,'g');
      let ans: any=[];
      recursiveReadFile(fileName)
      console.log(ans);
      return ans;
      function recursiveReadFile(fileName:any){
         if(!fs.existsSync(fileName)) return;
         if(isMDFile(fileName)){
            check(fileName);
         }
         if(isDirectory(fileName)){
            const files = fs.readdirSync(fileName);
            files.forEach(function(val: any,key: any){
               const temp = path.join(fileName,val);
               if(isDirectory(temp)) recursiveReadFile(temp);
               if (isMDFile(temp)) check(temp);
            })
         }
      }
      function check(fileName: any){
         const data = readFile(fileName);
         const stat = fs.statSync(fileName);
         const singleName =fileName.split('/').slice(-1)[0];
         const nameTest =regName.test(singleName);
         const result =data.match((reg));
         if (nameTest || result!==null){
            let obj = Object.assign({}, {
               matched: result,
               path: fileName,
               key: stat.ino,
               filename:singleName,
            });
            ans.push(obj);
         }
      }
      function isDirectory(fileName: any){
         if(fs.existsSync(fileName)) return fs.statSync(fileName).isDirectory();
      }
      function isMDFile(fileName: any){
         const singleName =fileName.split('/').slice(-1)[0];
         if(fs.existsSync(fileName)) return fs.statSync(fileName).isFile() && path.extname(singleName) ==='.md';
      }
      function readFile(fileName: any){
         if(fs.existsSync(fileName)) return fs.readFileSync(fileName,"utf-8");
      }
   }
}
