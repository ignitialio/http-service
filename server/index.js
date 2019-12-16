const got = require('got')

const Service = require('@ignitial/iio-services').Service
const config = require('./config')

class Http extends Service {
  constructor(options) {
    super(options)
  }

  // GET
  // ***************************************************************************
  get(url, options) {
    /* @_GET_ */
    return got.get(url, options)
  }

  // POST
  // ***************************************************************************
  post(args) {
    /* @_POST_ */
    return got.post(url, options)
  }

  // PUT
  // ***************************************************************************
  put(args) {
    /* @_PUT_ */
    return got.post(url, options)
  }

  // DELETE
  // ***************************************************************************
  delete(args) {
    /* @_DELETE_ */
    return got.delete(url, options)
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
