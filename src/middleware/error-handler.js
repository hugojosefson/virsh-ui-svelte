import { compose, identity, pick } from 'ramda'
import { errors } from 'compose-middleware'
import s from '../fn/s'

const SAFE_ERROR_PROPS = ['status', 'code', 'statusCode', 'message']

const errorHandler = (err, req, res, next) => {
  res.status(err.errors[0].status).type('application/hal+json').send(s(err))
}

export default ({ dev = process.env.NODE_ENV === 'development' } = {}) => {
  const clean = dev ? identity : pick(SAFE_ERROR_PROPS)
  const toErrorResponse = error => ({
    errors: [
      {
        status: error.status || error.code || error.statusCode || 500,
        ...error,
      },
    ],
  })
  const errorMapper = compose(toErrorResponse, clean)
  const errorMappingMiddleware = (err, req, res, next) => next(errorMapper(err))
  return errors(errorMappingMiddleware, errorHandler)
}
