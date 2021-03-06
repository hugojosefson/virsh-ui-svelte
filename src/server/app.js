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
import { render as renderNetworks } from '../routes/api/networks'
import { render as renderNetwork } from '../routes/api/networks/[networkId]'
import wsPush from './ws-push'
import wsUse from './ws-use-middleware'
import populateDomain from '../middleware/populate-domain'
import populateNetwork from '../middleware/populate-network'

export default async ({ dev, trustProxy }) => {
  const { getPath, onPath } = await initAppState()

  const domainsObsGetter = () => onPath(['domains'])
  const domainObsGetter = req => onPath(['domains', req.params.domainId])

  const networksObsGetter = () => onPath(['networks'])
  const networkObsGetter = req => onPath(['networks', req.params.networkId])

  const { app } = expressWs(express())
  return app
    .set('trust proxy', trustProxy)

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
    .ws('/api/networks', wsPush(networksObsGetter, renderNetworks))
    .ws(
      '/api/networks/:networkId',
      wsUse(populateNetwork(networkObsGetter)),
      wsPush(networkObsGetter, renderNetwork)
    )

    .use(compression({ threshold: 0 }))
    .use(sirv('static', { dev }))

    .use(populateSapperRoute({ manifest }))
    .use(sapperCors({ corsOptions: { origin: true } }))

    .use('/api/domains/:domainId', populateDomain(domainObsGetter))
    .use('/api/networks/:networkId', populateNetwork(networkObsGetter))
    .use(errorHandler({ dev }))
    .use(sapper.middleware())
}
