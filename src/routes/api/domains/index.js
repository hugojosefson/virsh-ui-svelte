import wrapInErrorHandler from '../../_wrap-in-error-handler'
import s from '../../../fn/s'
import { render as renderDomain } from './[domainId]'

export const get = wrapInErrorHandler((req, res, next) => {
  res.type('application/hal+json').send(
    s({
      _links: {
        self: `${req.protocol}://${req.headers.host}/api/domains`,
      },
      domains: Object.values(req.getPath(['domains'])).map(domain =>
        renderDomain({ ...req, domain })
      ),
    })
  )
})
