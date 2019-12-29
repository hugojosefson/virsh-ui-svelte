import express from 'express'
import compression from 'compression'
import sirv from 'sirv'
import * as sapper from '@sapper/server'
import { manifest } from '@sapper/internal/manifest-server'

import initAppState from './app-state'
import populateReq from '../middleware/populate-req'
import populateDomain from '../middleware/populate-domain'
import populateSapperRoute from '../middleware/populate-sapper-route'
import sapperCors from '../middleware/sapper-cors'
import errorHandler from '../middleware/error-handler'

export default async ({ dev }) => {
  const { getPath } = await initAppState()
  const reqProp = 'sapperRoute'
  const corsOptions = { origin: true }

  return express()
    .use(compression({ threshold: 0 }))
    .use(sirv('static', { dev }))

    .use(populateSapperRoute({ manifest, reqProp }))
    .use(sapperCors({ corsOptions, reqProp }))

    .use('/api/**', populateReq({ getPath }))
    .use('/api/domains/:domain', populateDomain(getPath))
    .use(errorHandler({ dev }))

    .use(sapper.middleware())
}
