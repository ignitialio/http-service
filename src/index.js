import Http from './components/Http.vue'

// function to be called when service loaded into web app:
// naming rule: iios_<service_unique_name>
//
global.iios_http = function(Vue) {
  // Warning: component name must be globally unique in your host app
  Vue.component('http', Http)

  let register = () => {
    // EXEAMPLE
    Vue.prototype.$services.emit('app:menu:add', [
      {
        path: '/service-http',
        title: 'HTTP requests',
        svgIcon: '$$service(http)/assets/http-64.png',
        section: 'Services',
        anonymousAccess: true,
        hideIfLogged: false,
        route: {
          name: 'HTTP requests',
          path: '/service-http',
          component: Http
        }
      }
    ])

    let onServiceDestroy = () => {
      Vue.prototype.$services.emit('app:menu:remove', [{
        path: '/service-http'
      }])

      Vue.prototype.$services.emit('service:destroy:http:done')
    }

    Vue.prototype.$services.once('service:destroy:http', onServiceDestroy)
  }

  if (Vue.prototype.$services.appReady) {
    register()
  } else {
    Vue.prototype.$services.once('app:ready', register)
  }
}
