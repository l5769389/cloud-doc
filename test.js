let fileName ="/Users/ljun/Documents/书籍/markdown笔记/css笔记.md";
const singleName =fileName.split('/').slice(-1)[0];
const reg = new RegExp(`css笔记`,'g');
console.log(reg.test(singleName))