import Vue from 'vue'
import App from './App.vue'
import VueLazyload from './vue-business-lazyload'

Vue.config.productionTip = false

Vue.use(VueLazyload, {
  preLoad: 1.3, // 可见区域的1.3倍
  loading, // loading图
})

new Vue({
  render: h => h(App),
}).$mount('#app')
