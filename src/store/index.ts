import { createStore } from 'vuex'

export default createStore({
  state: {
    activeObj:{
      activeFileName:'',
      activeKey:'',
      activePath:''
    }
  },
  mutations: {
    setActiveObj:(state, payload) => {
      state.activeObj.activeFileName=payload.activeFileName;
      state.activeObj.activeKey =payload.activeKey;
      state.activeObj.activePath =payload.activePath;
      console.log(state.activeObj);
    }
  },
  getters:{
    getActiveObj:state =>{
      return state.activeObj;
    }
  },
  actions: {
  },
  modules: {
  }
})
