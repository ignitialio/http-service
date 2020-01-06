const got = require('got')

const Service = require('@ignitial/iio-services').Service
const utils = require('@ignitial/iio-services').utils
const config = require('./config')

class HTTPInstance {
  constructor(id) {
    this._id = id
  }

  _preset(period) {
    return new Promise((resolve, reject) => {
      if (this.interval) {
        clearInterval(this.interval)
        this.interval = null
      }

      this.interval = setInterval(this.process, period)
      resolve()
    })
  }

  _clearPreset() {
    return new Promise((resolve, reject) => {
      clearInterval(this.interval)
      resolve()
    })
  }

  /* normalize from array to object */
  _normalizeHeaders(options) {
    if (options.headers && Array.isArray(options.headers)) {
      let headers = {}

      for (let kv of options.headers) {
        headers[kv.key] = kv.value
      }

      options.headers = headers
    }
  }

  // GET
  // ***************************************************************************
  get(url, options, grants) {

console.log(this._id, url, options)
    /* @_GET_ */
    return new Promise((resolve, reject) => {
      if (!grants) {
        // prevent arguments mismatch
        grants = JSON.parse(JSON.stringify(options))
        options = undefined
      }

      if (options) {
        this._normalizeHeaders(options)
      }
console.log(url, options)
      got.get(url, options).then(result => {
        resolve(result.body)
      }).catch(err => reject(err))
    })
  }

  // POST
  // ***************************************************************************
  post(url, options, grants) {
    /* @_POST_ */
    if (!grants) {
      // prevent arguments mismatch
      grants = JSON.parse(JSON.stringify(options))
      options = undefined
    }

    if (options) {
      this._normalizeHeaders(options)
    }

    return got.post(url, options)
  }

  // PUT
  // ***************************************************************************
  put(url, options, grants) {
    /* @_PUT_ */
    if (!grants) {
      // prevent arguments mismatch
      grants = JSON.parse(JSON.stringify(options))
      options = undefined
    }

    if (options) {
      this._normalizeHeaders(options)
    }

    return got.put(url, options)
  }

  // DELETE
  // ***************************************************************************
  delete(url, options, grants) {
    /* @_DELETE_ */
    if (!grants) {
      // prevent arguments mismatch
      grants = JSON.parse(JSON.stringify(options))
      options = undefined
    }

    if (options) {
      this._normalizeHeaders(options)
    }

    return got.delete(url, options)
  }
}

class Http extends Service {
  constructor(options) {
    super(options)

    this._instances = {}
  }

  addInstance(id) {
    /* @_POST_ */
    return new Promise((resolve, reject) => {
      try {
        if (this._instances[id]) {
          delete this._instances[id]
        }

        this._instances[id] = new HTTPInstance(id)
        let methods = utils.getMethods(this._instances[id])

        for (let method of methods) {
          this[method + '_' + id] = this._instances[id][method].bind(this._instances[id])
        }

        resolve()
      } catch (err) {
        reject(err)
      }
    })
  }

  removeInstance(id) {
    /* @_DELETE_ */
    return new Promise((resolve, reject) => {
      delete this._instances[id]

      resolve()
    })
  }

  workflowNodePreset(node) {
    return new Promise((resolve, reject) => {
      utils.waitForPropertyInit(this._instances, node.instance).then(async () => {
        try {
          for (let output of node.outputs) {
            await this.presetMethodArgs(output.method, [ node.options.url, {
              headers: node.options.headers,
              responseType: node.options.responseType
            }])
          }
console.log('node preset', node.id, node.label)
          resolve()
        } catch (err) {
          reject(err)
        }
      }).catch(err => reject(err))
    })
  }

  workflowNodeClearPreset(node) {
    return new Promise((resolve, reject) => {
      if (this._instances[node.instance]) {
        resolve()
      } else {
        reject(new Error('missing instance'))
      }
    })
  }

  getInstances() {
    /* @_GET_ */
    return new Promise((resolve, reject) => {
      resolve(Object.keys(this._instances))
    })
  }

  getMethods(instanceId) {
    /* @_GET_ */
    return new Promise((resolve, reject) => {
      resolve(utils.getMethods(this).filter(e => e.match(instanceId)))
    })
  }
}

// instantiate service with its configuration
const http = new Http(config)

http._init().then(() => {
  console.log('service [' + http.name + '] initialization done with options ',
    http._options)
}).catch(err => {
  console.error('initialization failed', err)
  process.exit(1)
})
