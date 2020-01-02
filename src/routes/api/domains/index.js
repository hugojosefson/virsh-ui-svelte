import wrapInErrorHandler from '../../_wrap-in-error-handler'
import s from '../../../fn/s'
import { selfLink } from './_self-link'
import { render as renderDomain } from './[domainId]'

export const render = (req, overrideDomains) => {
  const effectiveDomains = overrideDomains || req.getPath(['domains'])
  return {
    _links: { self: selfLink(req) },
    _collection: Object.values(effectiveDomains).map(domain =>
      renderDomain(req, domain)
    )
  }
}

export const get = wrapInErrorHandler((req, res, next) => {
  res.type('application/hal+json').send(s(render(req)))
})
