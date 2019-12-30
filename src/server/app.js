import express from 'express'
import expressWs from 'express-ws'
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
import { render as renderDomains } from '../routes/api/domains'
import wsPusher from './ws-pusher'

export default async ({ dev }) => {
  const { getAppStateStream, getPath } = await initAppState()
  const onAppState = wsPusher(getAppStateStream)

  return expressWs(express())
    .app.use('/api/**', populateReq({ getPath }))
    .ws('/api/domains', onAppState(renderDomains))

    .use(compression({ threshold: 0 }))
    .use(sirv('static', { dev }))

    .use(populateSapperRoute({ manifest }))
    .use(sapperCors({ corsOptions: { origin: true } }))

    .use('/api/domains/:domain', populateDomain(getPath))
    .use(errorHandler({ dev }))

    .use(sapper.middleware())
}
