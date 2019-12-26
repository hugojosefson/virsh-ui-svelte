import { hasPath } from 'ramda'
import express from 'express'
import compression from 'compression'
import sirv from 'sirv'
import * as sapper from '@sapper/server'
import initAppState from './app-state'
import { getDomains } from './virsh'

import { manifest } from '@sapper/internal/manifest-server'

const checkDomainExists = () => (req, res, next) => {
  const domain = req.params.domain
  const data = req.appState.getData()
  if (hasPath(['domains', domain], data)) {
    req.domain = domain
    next()
  } else {
    res.status(404).send()
  }
}

export default async ({ dev }) => {
  const domains = await getDomains()
  const appState = initAppState({ domains })
  return express()
    .use(compression({ threshold: 0 }))
    .use(sirv('static', { dev }))
    .use((req, res, next) => {
      req.appState = appState
      next()
    })
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
}
