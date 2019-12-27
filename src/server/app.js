import { hasPath } from 'ramda'
import express from 'express'
import compression from 'compression'
import sirv from 'sirv'
import * as sapper from '@sapper/server'
import initAppState from './app-state'

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

const populateReq = props => (req, res, next) => {
  Object.assign(req, props)
  next()
}

export default async ({ dev, trustProxy }) => {
  const appState = await initAppState()
  return express()
    .set('trust proxy', trustProxy)
    .use(compression({ threshold: 0 }))
    .use(sirv('static', { dev }))
    .use(populateReq({ appState }))
    .use('/api/domains/:domain/:command', checkDomainExists())
    .use(sapper.middleware())
}
