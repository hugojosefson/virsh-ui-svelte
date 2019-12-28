import wrapInErrorHandler from '../../_wrap-in-error-handler'
import s from '../../../fn/s'
import { renderData, renderLinks } from './[domainId]'
export const get = wrapInErrorHandler((req, res, next) => {
  res.type('application/vnd.api+json').send(
    s({
      jsonapi: {
        version: '1.0',
      },
      data: Object.values(req.getPath(['domains'])).map(domain => ({
        ...renderData({ domain }),
        links: renderLinks({
          domain,
          protocol: req.protocol,
          headers: req.headers,
        }),
      })),
      links: {
        self: `${req.protocol}://${req.headers.host}/api/domains`,
      },
    })
  )
})
