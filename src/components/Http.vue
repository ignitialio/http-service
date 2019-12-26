<template>
  <div :id="id" class="http-layout">
    <ig-form v-if="!!config && !!schema" class="http-form"
      :value="config" @input="handleConfig"
      :schema="schema"></ig-form>
  </div>
</template>

<script>
export default {
  props: {
    /* used when source for worklows */
    node: {
      type: Object
    },
    options: {
      type: Object
    }
  },
  data: () => {
    return {
      id: 'http_' + Math.random().toString(36).slice(2),
      config: {
        url: '',
        method: 'GET',
        responseType: 'json',
        headers: []
      },
      schema: null
    }
  },
  watch: {
    options: {
      handler: function(val) {
        this.config = JSON.parse(JSON.stringify(this.options))
      },
      deep: true
    }
  },
  methods: {
    _preset() {
      for (let output of this.node.outputs) {
        this.$services.waitForService('http').then(httpService => {
          console.log([ this.config.url, {
            headers: this.config.headers,
            responseType: this.config.responseType
          }])
          httpService.presetMethodArgs(output.method, [ this.config.url, {
            headers: this.config.headers,
            responseType: this.config.responseType
          }]).catch(err => console.log(err))
        }).catch(err => console.log(err))
      }
    },
    handleConfig(val) {
      console.log('HTTP', $j(val))
      this.$emit('update:options', val)
      this._preset()
    }
  },
  mounted() {
    if (this.options) {
      this.config = JSON.parse(JSON.stringify(this.options))
      // use older configs
      this.config.responseType = this.config.responseType || 'json'
    } else {
      this.$emit('update:options', this.config)
    }

    // dev
    // refresh service UI on hot reload
    this.$services.once('service:up', service => {
      if (service.name === 'http') {
        localStorage.setItem('HR_PATH', '/service-http')
        window.location.reload()
      }
    })

    this.$services.waitForService('http').then(httpService => {
      this.schema = this.$services.servicesDico.http.options.schema
      this._preset()
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
