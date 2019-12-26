const fs = require('fs')
const path = require('path')
const YAML = require('yaml')

function envBrowseAndReplace(config) {
  for (let prop in config) {
    if (typeof config[prop] !== 'string' && typeof config[prop] !== 'number') {
      config[prop] = envBrowseAndReplace(config[prop])
    } else {
      if (typeof config[prop] === 'string') {
        let envVarMatch = config[prop].match(/env\((.*?)\)/)
        if (envVarMatch) {
          config[prop] = process.env[envVarMatch[1]]
        }
      }
    }
  }

  return config
}

let generatedConfigPath = path.join(process.cwd(), 'server', 'config', 'generated', 'config.json')
if (fs.existsSync(generatedConfigPath)) {
  let config = JSON.parse(fs.readFileSync(generatedConfigPath, 'utf8'))
  config = envBrowseAndReplace(config)
  console.log('WARNING: using YAML configuration')
  module.exports = config
  return
}

console.log('WARNING: generated file [' + generatedConfigPath + '] does not exist. switch to env config')

// REDIS configuration
// -----------------------------------------------------------------------------
const IIOS_REDIS_PORT = process.env.IIOS_REDIS_PORT ? parseInt(process.env.IIOS_REDIS_PORT) : 6379
const IIOS_REDIS_DB = process.env.IIOS_REDIS_DB ? parseInt(process.env.IIOS_REDIS_DB) : 0
const IIOS_REDIS_ACCESSDB = process.env.IIOS_REDIS_ACCESSDB || 1
let IIOS_REDIS_SENTINELS

if (process.env.IIOS_REDIS_SENTINELS) {
  IIOS_REDIS_SENTINELS = []
  let sentinels = process.env.IIOS_REDIS_SENTINELS.split(',')
  for (let s of sentinels) {
    IIOS_REDIS_SENTINELS.push({ host: s.split(':')[0], port: s.split(':')[1] })
  }
}

// Main configuration structure
// -----------------------------------------------------------------------------
module.exports = {
  /* service name */
  name: process.env.IIOS_SERVICE_NAME || 'http',
  /* service namesapce */
  namespace: process.env.IIOS_NAMESPACE || 'ignitialio',
  /* heartbeat */
  heartbeatPeriod: 5000,
  /* PUB/SUB/KV connector */
  connector: {
    /* redis server connection */
    redis: {
      /* encoder to be used for packing/unpacking raw messages */
      encoder: process.env.IIOS_ENCODER || 'bson',
      master: process.env.IIOS_REDIS_MASTER || 'mymaster',
      sentinels: IIOS_REDIS_SENTINELS,
      host: process.env.IIOS_REDIS_HOST,
      port: IIOS_REDIS_PORT,
      db: IIOS_REDIS_DB
    },
  },
  /* access control: if present, acces control enabled */
  accesscontrol: {
    /* access control namespace */
    namespace: process.env.IIOS_NAMESPACE || 'ignitialio',
    /* grants for current service: auto-fill */
    grants: {
      __privileged__: {
        'create:any': [ '*' ],
        'read:any': [ '*' ],
        'update:any': [ '*' ],
        'delete:any': [ '*' ]
      },
      admin: {
        'create:any': [ '*' ],
        'read:any': [ '*' ],
        'update:any': [ '*' ],
        'delete:any': [ '*' ]
      },
      user: {
        'read:any': [ '*' ],
        'update:any': [ '*' ],
        'delete:any': [ '*' ]
      },
      anonymous: {
        'read:any': [ '*' ]
      }
    },
    /* connector configuration: optional, default same as global connector, but
       on DB 1 */
    connector: {
      /* redis server connection */
      redis: {
        encoder: process.env.IIOS_ENCODER || 'bson',
        master: process.env.IIOS_REDIS_MASTER || 'mymaster',
        sentinels: IIOS_REDIS_SENTINELS,
        host: process.env.IIOS_REDIS_HOST,
        port: IIOS_REDIS_PORT,
        db: IIOS_REDIS_ACCESSDB
      }
    }
  },
  /* HTTP server declaration */
  server: {
    /* server host */
    host: process.env.IIOS_SERVER_HOST,
    /* server port */
    port: process.env.IIOS_SERVER_PORT,
    /* path to statically serve (at least one asset for icons for example) */
    path: process.env.IIOS_SERVER_PATH_TO_SERVE || './dist',
    /* indicates that service is behind an HTTPS proxy */
    https: false,
  },
  /* options published through discovery mechanism */
  publicOptions: {
    /* declares component injection */
    uiComponentInjection: true,
    /* service description */
    description: {
      /* service icon */
      icon: 'assets/http-64.png',
      /* Internationalization: see Ignitial.io Web App */
      i18n: {
        'HTTP requests':  [
          'Requêtes HTTP'
        ]
      },
      /* eventually any other data */
      title: 'HTTP',
      info: 'Requêtes HTTP'
    },
    /* can be an worflow (Chaman) block */
    workflow: {
      types: [ 'Source' ],
      hasWidget: false,
      isMultinstance: true,
      outputs: [
        {
          name: 'dataOut',
          type: 'rpc',
          method: 'get'
        }
      ]
    },
    /* configuration data schema */
    schema: {
      title: 'Configuration',
      type: 'object',
      _meta: {
        type: null
      },
      properties: {
        url: {
          title: 'URL',
          type: 'string',
          _meta: {
            type: null
          }
        },
        method: {
          title: 'HTTP method',
          type: 'string',
          enum: [
            'GET', 'POST'
          ],
          _meta: {
            type: 'enum',
            i18n: {
              'HTTP method': [ 'Méthode HTTP', 'Método HTTP' ]
            }
          }
        },
        responseType: {
          title: 'Response type',
          type: 'string',
          enum: [
            'text', 'json', 'buffer'
          ],
          default: 'json',
          _meta: {
            type: 'enum',
            i18n: {
              'Response type': [ 'Type de la réponse', 'Tipo de respuesta' ]
            }
          }
        },
        headers: {
          title: 'HTTP request headers',
          type: 'array',
          items: {
            title: 'Header',
            type: 'object',
            properties: {
              key: {
                type: 'string',
                title: 'Header key',
                default: '',
                _meta: {
                  type: null,
                  i18n: {
                    'Header key': [ 'Clé', 'Clave' ]
                  }
                }
              },
              value: {
                type: 'string',
                title: 'Header value',
                default: '',
                _meta: {
                  type: null,
                  i18n: {
                    'Header value': [ 'Valeur', 'Valor' ]
                  }
                }
              }
            },
            _meta: {
              type: null,
              i18n: {
                'Header': [ 'Entête', 'Encabezado' ]
              }
            }
          },
          _meta: {
            type: null,
            i18n: {
              'HTTP request headers': [ 'Entêtes de requête HTTP', 'Encabezados de solicitud HTTP' ]
            }
          }
        }
      }
    }
  }
}
