import { compose, identity, pick } from 'ramda'
import { errors } from 'compose-middleware'
import s from '../fn/s'

const SAFE_ERROR_PROPS = ['status', 'code', 'statusCode', 'message']

const errorHandler = (err, req, res, next) => {
  res.status(err.errors[0].status).type('json').send(s(err))
}

export default ({ dev = process.env.NODE_ENV === 'development' } = {}) => {
  const clean = dev ? identity : pick(SAFE_ERROR_PROPS)
  const toJsonApi = error => ({
    jsonapi: { version: '1.0' },
    errors: [
      {
        status: error.status || error.code || error.statusCode || 500,
        ...error,
      },
    ],
  })
  const errorMapper = compose(toJsonApi, clean)
  const errorMappingMiddleware = (err, req, res, next) => next(errorMapper(err))
  return errors(errorMappingMiddleware, errorHandler)
}
