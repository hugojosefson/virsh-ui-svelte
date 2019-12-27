import wrapInErrorHandler from '../../../_wrap-in-error-handler'
import s from '../../../../fn/s'

export const get = wrapInErrorHandler((req, res, next) => {
  res.type('json').send(
    s({
      jsonapi: {
        version: '1.0',
      },
      data: {
        type: 'domain',
        ...req.domain,
      },
    })
  )
})
