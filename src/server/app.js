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

export default async ({ dev, trustProxy }) => {
  const { getPath } = await initAppState()
  const routeProp = 'sapperRoute'
  const corsOptions = { origin: true }

  return express()
    .set('trust proxy', trustProxy)
    .use(compression({ threshold: 0 }))
    .use(sirv('static', { dev }))

    .use(populateSapperRoute({ manifest, routeProp }))
    .use(sapperCors({ corsOptions, routeProp }))

    .use('/api/**', populateReq({ getPath }))
    .use('/api/domains/:domain', populateDomain(getPath))
    .use(errorHandler({ dev }))

    .use(sapper.middleware())
}
