const fs =require('fs');
const path =require('path');
const base =path.resolve('/Users/ljun/Documents/test-mde/');

//创建文件夹
// fs.mkdir(path.join(base,'css'),function(error){
//     if(error){
//         console.log(error);
//         return false;
//     }
//     console.log('创建目录成功');
// })

// fs.unlink(path.join(base,'2.md'),function(error){
//     if(error){
//         console.log(error);
//         return false;
//     }
//     console.log('删除目录成功');
// })
function rmdir(pathDir){
       try {
         function resur(pathDir){
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
         return 'ok'
       }
       catch (e){
          return e;
       }
}
// const aa =rmdir(path.join(base,'fold111aaaa'));
// console.log(aa);

