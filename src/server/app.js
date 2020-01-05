import express from 'express'
import expressWs from 'express-ws'
import compression from 'compression'
import sirv from 'sirv'
import { of } from 'rxjs'
import * as sapper from '@sapper/server'
import { manifest } from '@sapper/internal/manifest-server'

import initAppState from './app-state'
import populateReq from '../middleware/populate-req'
import populateSapperRoute from '../middleware/populate-sapper-route'
import sapperCors from '../middleware/sapper-cors'
import errorHandler from '../middleware/error-handler'
import { render as renderDomains } from '../routes/api/domains'
import { render as renderDomain } from '../routes/api/domains/[domainId]'
import wsPush from './ws-push'
import wsUse from './ws-use-middleware'
import populateDomain from '../middleware/populate-domain'

export default async ({ dev }) => {
  const { getPath, onPath } = await initAppState()

  const domainsObsGetter = () => onPath(['domains'])
  const domainObsGetter = req => onPath(['domains', req.params.domainId])

  const { app } = expressWs(express())
  return app
    .use(
      '/api/**',
      populateReq(() => of({ getPath, onPath }))
    )
    .ws('/api/domains', wsPush(domainsObsGetter, renderDomains))
    .ws(
      '/api/domains/:domainId',
      wsUse(populateDomain(domainObsGetter)),
      wsPush(domainObsGetter, renderDomain)
    )

    .use(compression({ threshold: 0 }))
    .use(sirv('static', { dev }))

    .use(populateSapperRoute({ manifest }))
    .use(sapperCors({ corsOptions: { origin: true } }))

    .use('/api/domains/:domainId', populateDomain(domainObsGetter))
    .use(errorHandler({ dev }))
    .use(sapper.middleware())
}
