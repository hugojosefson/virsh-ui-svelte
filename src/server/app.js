import express from 'express'
import compression from 'compression'
import sirv from 'sirv'
import * as sapper from '@sapper/server'
import { getUuid } from './virsh'

import { manifest } from '@sapper/internal/manifest-server'

const checkDomainExists = () => (req, res, next) => {
  const { domain } = req.params
  getUuid(domain).then(
    uuid => {
      req.uuid = uuid
      next()
    },
    () => res.status(404).send()
  )
}

export default ({ dev, trustProxy }) =>
  express()
    .set('trust proxy', trustProxy)
    .use(compression({ threshold: 0 }))
    .use(sirv('static', { dev }))
    .use('/api/domains/:domain/:command', checkDomainExists())
    .use(sapper.middleware())
    .use((req, res, next) => {
      const route = manifest.server_routes.find(route =>
        route.pattern.test(req.path)
      )
      if (route) {
        res.statusCode = 405
        res.setHeader('Allow', Object.keys(route.handlers).join(', '))
        res.end('Method Not Allowed')
      } else {
        next()
      }
    })
