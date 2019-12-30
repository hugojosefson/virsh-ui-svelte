import wrapInErrorHandler from '../../../_wrap-in-error-handler'
import s from '../../../../fn/s'
import { selfLink as domainsLink } from '../_self-link'

export const render = req => ({
  _links: renderLinks(req),
  ...req.domain
})

export const renderLinks = req => ({
  self: selfLink(req),
  start: mayStart(req.domain) ? `${selfLink(req)}/start` : undefined,
  shutdown: mayShutdown(req.domain) ? `${selfLink(req)}/shutdown` : undefined
})

export const selfLink = req => `${domainsLink(req)}/${req.domain.id}`

const mayStart = ({ state }) =>
  !['running', 'started'].includes(state.toLowerCase())

const mayShutdown = ({ state }) =>
  !['shutdown', 'shut off', 'stopped'].includes(state.toLowerCase())

export const get = wrapInErrorHandler((req, res, next) => {
  res.type('application/hal+json').send(s(render(req)))
})
