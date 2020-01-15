<template>
  <div :id="id" class="http-layout">
    <ig-form v-if="!!settings && !!schema" class="http-form"
      :value="settings" @input="handleConfig"
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
      settings: {
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
        this.settings = JSON.parse(JSON.stringify(this.options))
        console.log('update options on watch', $j(this.settings))
      },
      deep: true
    }
  },
  methods: {
    _preset() {
      this.$services.waitForService('http').then(httpService => {
        httpService.workflowNodePreset(this.node).catch(err => console.log(err))
      }).catch(err => console.log(err))
    },
    handleConfig(val) {
      console.log('HTTP', $j(val))
      this.$emit('update:options', val)
      this._preset()
    }
  },
  mounted() {
    if (this.options) {
      this.settings = JSON.parse(JSON.stringify(this.options))
      // use older settingss
      this.settings.responseType = this.settings.responseType || 'json'
    } else {
      this.$emit('update:options', this.settings)
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
