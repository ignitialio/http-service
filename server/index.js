const got = require('got')

const Service = require('@ignitial/iio-services').Service
const utils = require('@ignitial/iio-services').utils
const config = require('./config')

class HTTPInstance {
  constructor(id) {
    this._id = id
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
          this[method + '_' + id] = this._instances[id][method]
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
