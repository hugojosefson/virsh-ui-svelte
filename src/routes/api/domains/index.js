import wrapInErrorHandler from '../../_wrap-in-error-handler'
import s from '../../../fn/s'
import { render as renderDomain } from './[domainId]'
import { selfLink } from './_self-link'

export const get = wrapInErrorHandler((req, res, next) => {
  res.type('application/hal+json').send(
    s({
      _links: { self: selfLink(req) },
      _collection: Object.values(req.getPath(['domains'])).map(domain =>
        renderDomain({ ...req, protocol: req.protocol, domain })
      ),
    })
  )
})
