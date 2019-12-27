import errorHandler from '../middleware/error-handler'
import express from 'express'
import compression from 'compression'
import sirv from 'sirv'
import * as sapper from '@sapper/server'
import initAppState from './app-state'
import populateDomain from '../middleware/populate-domain'
import populateReq from '../middleware/populate-req'

export default async ({ dev }) => {
  const { getPath } = await initAppState()

  return express()
    .use(compression({ threshold: 0 }))
    .use(sirv('static', { dev }))
    .use('/api/**', populateReq({ getPath }))
    .use('/api/domains/:domain', populateDomain(getPath))
    .use(errorHandler({ dev }))
    .use(sapper.middleware())
}
