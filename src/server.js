import sirv from 'sirv'
import express from 'express'
import compression from 'compression'
import * as sapper from '@sapper/server'
import envConfig from '@hugojosefson/env-config'

const { PORT, NODE_ENV } = envConfig()
const dev = NODE_ENV === 'development'

express()
  .use(
    compression({ threshold: 0 }),
    sirv('static', { dev }),
    sapper.middleware()
  )
  .listen(PORT, err => {
    if (err) console.error('error', err)
  })
