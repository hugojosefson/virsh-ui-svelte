import sirv from 'sirv'
import express from 'express'
import compression from 'compression'
import * as sapper from '@sapper/server'
import envConfig from '@hugojosefson/env-config'

const { PORT, NODE_ENV, TRUST_PROXY } = envConfig()
const dev = NODE_ENV === 'development'
const trustProxy =
  typeof TRUST_PROXY === 'undefined' ? () => false : TRUST_PROXY

express()
  .use(
    compression({ threshold: 0 }),
    sirv('static', { dev }),
    sapper.middleware()
  )
  .set('trust proxy', trustProxy)
  .listen(PORT, err => {
    if (err) console.error('error', err)
  })
