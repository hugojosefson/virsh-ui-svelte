import express from 'express'
import compression from 'compression'
import sirv from 'sirv'
import * as sapper from '@sapper/server'
import initAppState from './app-state'

const populateDomain = getPath => (req, res, next) => {
  const domain = getPath(['domains', req.params.domain])

  if (domain) {
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

export default async ({ dev }) => {
  const { getPath } = await initAppState()

  return express()
    .use(compression({ threshold: 0 }))
    .use(sirv('static', { dev }))
    .use('/api/**', populateReq({ getPath }))
    .use('/api/domains/:domain', populateDomain(getPath))
    .use('/api/domains/:domain/**', populateDomain(getPath))
    .use(sapper.middleware())
}
