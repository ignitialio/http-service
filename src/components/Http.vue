<template>
  <div :id="id" class="http-layout">
    <ig-form v-if="!!config && !!schema" class="http-form"
      v-model="config" :schema="schema"></ig-form>
  </div>
</template>

<script>
export default {
  props: {
    /* use when source for worklows */
    defaultMethod: {
      type: String
    }
  },
  data: () => {
    return {
      id: 'http_' + Math.random().toString(36).slice(2),
      config: {
        url: '',
        method: 'GET',
        headers: []
      },
      schema: null
    }
  },
  watch: {
    config: function(val) {
      if (this.defaultMethod) {
        this.$services.waitForService('http').then(httpService => {
          httpService.presetMethodArgs(this.defaultMethod, [ config.url ])
            .catch(err => console.log(err))
        }).catch(err => console.log(err))
      }
    }
  },
  computed: {

  },
  methods: {
  },
  mounted() {
    // dev
    // refresh service UI on hot reload
    this.$services.once('service:up', service => {
      if (service.name === 'http') {
        localStorage.setItem('HR_PATH', '/service-http')
        window.location.reload()
      }
    })

    this.$services.waitForService('http').then(async httpService => {
      try {
        this.schema = this.$services.servicesDico.http.options.schema
      } catch (err) {
        console.log(err)
      }
    }).catch(err => console.log(err))
  },
  beforeDestroy() {

  }
}
</script>

<style>
.http-layout {
  width: 100%;
  height: calc(100% - 0px);
  overflow-y: auto;
  padding: 4px 8px;
}

.http-form {
  width: 100%;
}
</style>
