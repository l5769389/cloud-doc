import { createApp } from 'vue'
import App from './App.vue'
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/antd.css';
import router from './router'
import store from './store'
import '@fortawesome/fontawesome-free/css/all.css';
const app =createApp(App);
app.use(Antd);
app.use(store).use(router).mount('#app')
