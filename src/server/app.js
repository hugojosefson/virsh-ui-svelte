import express from 'express'
import compression from 'compression'
import sirv from 'sirv'
import * as sapper from '@sapper/server'
import { manifest } from '@sapper/internal/manifest-server'

import initAppState from './app-state'
import populateReq from '../middleware/populate-req'
import populateDomain from '../middleware/populate-domain'
import populateDeclaredRoute from '../middleware/populate-declared-route'
import sapperCors from '../middleware/sapper-cors'
import errorHandler from '../middleware/error-handler'

export default async ({ dev }) => {
  const { getPath } = await initAppState()

  return express()
    .use(compression({ threshold: 0 }))
    .use(sirv('static', { dev }))
    .use(populateDeclaredRoute(manifest))
    .use(sapperCors({ origin: true }))
    .use('/api/**', populateReq({ getPath }))
    .use('/api/domains/:domain', populateDomain(getPath))
    .use(errorHandler({ dev }))
    .use(sapper.middleware())
}
