const got = require('got')
const jsf = require('json-schema-faker')

const Service = require('@ignitial/iio-services').Service
const utils = require('@ignitial/iio-services').utils
const config = require('./config')

class HTTPInstance {
  constructor(id) {
    this._id = id
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

  /* workflow nodes mandatory API (if multi-instance) */
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

  /* workflow nodes mandatory API (if multi-instance) */
  removeInstance(id) {
    /* @_DELETE_ */
    return new Promise((resolve, reject) => {
      delete this._instances[id]

      resolve()
    })
  }

  /* workflow nodes mandatory API (if multi-instance) */
  getInstances() {
    /* @_GET_ */
    return new Promise((resolve, reject) => {
      resolve(Object.keys(this._instances))
    })
  }

  /* workflow nodes mandatory API (if multi-instance) */
  getMethods(instanceId) {
    /* @_GET_ */
    return new Promise((resolve, reject) => {
      resolve(utils.getMethods(this).filter(e => e.match(instanceId)))
    })
  }

  /* workflow nodes mandatory API: node preset */
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

          resolve()
        } catch (err) {
          reject(err)
        }
      }).catch(err => reject(err))
    })
  }

  /* workflow nodes mandatory API: clear node preset if any */
  workflowNodeClearPreset(node) {
    return new Promise((resolve, reject) => {
      if (this._instances[node.instance]) {
        resolve()
      } else {
        reject(new Error('missing instance'))
      }
    })
  }

  /* workflow nodes mandatory API: get default settings */
  getDefaultSettings() {
    return new Promise((resolve, reject) => {
      let schema = this._options.publicOptions.schema

      jsf.option({
        failOnInvalidTypes: false,
        useDefaultValue: true,
        useExamplesValue: true,
        requiredOnly: false,
        fillProperties: true
      })

      function addRequiredFlag(schema) {
        schema._meta = schema._meta || { type: null }

        if (schema.properties) {
          schema.required = Object.keys(schema.properties)

          for (let prop in schema.properties) {
            schema.properties[prop] = addRequiredFlag(schema.properties[prop])
          }
        } else {
          if (schema.type === 'array') {
            if (schema.items.properties) {
              schema.items.required = Object.keys(schema.items.properties)
              schema.items._meta = schema.items._meta || { type: null }

              if (schema.items.type === 'object') {
                for (let prop in schema.items.properties) {
                  schema.items.properties[prop] = addRequiredFlag(schema.items.properties[prop])
                }
              }
            } else if (Array.isArray(schema.items)) {
              for (let item of schema.items) {
                if (item.type === 'object') {
                  for (let prop in item.properties) {
                    item.required = Object.keys(item.properties)
                    item._meta = item._meta || { type: null }

                    item.properties[prop] = addRequiredFlag(item.properties[prop])
                  }
                }
              }
            }
          }
        }

        return schema
      }

      try {
        schema = addRequiredFlag(schema)
        let obj = jsf.generate(schema)

        resolve(obj)
      } catch (err) {
        reject(err)
      }
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
