import Vue from 'vue'
import Http from '../src/components/Http.vue'

Vue.config.productionTip = false

new Vue({
  render: h => h(Http),
}).$mount('#app')
