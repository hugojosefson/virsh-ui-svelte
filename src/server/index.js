import envConfig from '@hugojosefson/env-config'
import camelcase from 'camelcase'
import { renameKeysWith } from 'ramda-adjunct'
import s from '../fn/s'
import app from './app'
import startServer from './start-server'

const keys = ['PORT', 'NODE_ENV', 'TRUST_PROXY', 'AUTH']
const adjustConfigValues = c => ({
  dev: c.nodeEnv === 'development',
  trustProxy: typeof c.trustProxy === 'undefined' ? () => false : c.trustProxy,
  ...c,
})

;(async () => {
  const config = envConfig({
    keys,
    transformers: [renameKeysWith(camelcase), adjustConfigValues],
  })
  console.log('server: config: ', s(config))

  app(config)
    .then(startServer(config.port))
    .then(
      server => {
        console.log(`server: Listening on ${s(server.address())}`)
      },
      error => {
        console.error('server: error', error)
        process.exit(1)
      }
    )
})()
