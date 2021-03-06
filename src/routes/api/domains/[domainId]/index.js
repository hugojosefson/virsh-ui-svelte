import wrapInErrorHandler from '../../../_wrap-in-error-handler'
import s from '../../../../fn/s'
import { selfLink as domainsLink } from '../_self-link'

export const render = (req, overrideDomain) => {
  const effectiveReq = {
    ...req,
    domain: overrideDomain || req.domain,
  }
  return {
    _links: renderLinks(effectiveReq),
    ...effectiveReq.domain,
  }
}

export const renderLinks = req => ({
  self: selfLink(req),
  start: mayStart(req.domain) ? `${selfLink(req)}/start` : undefined,
  resume: mayResume(req.domain) ? `${selfLink(req)}/resume` : undefined,
  pause: mayPause(req.domain) ? `${selfLink(req)}/pause` : undefined,
  stop: mayStop(req.domain) ? `${selfLink(req)}/stop` : undefined,
})

export const selfLink = req => `${domainsLink(req)}/${req.domain.id}`

const mayStart = ({ state }) =>
  !['running', 'started', 'resumed', 'on', 'paused', 'suspended'].includes(
    state.toLowerCase()
  )

const mayResume = ({ state }) =>
  ['paused', 'suspended'].includes(state.toLowerCase())

const mayPause = ({ state }) =>
  ['running', 'started', 'resumed', 'on'].includes(state.toLowerCase())

const mayStop = ({ state }) =>
  !['shutdown', 'shut off', 'stopped', 'off', 'paused', 'suspended'].includes(
    state.toLowerCase()
  )

export const get = wrapInErrorHandler((req, res, next) => {
  res.type('application/hal+json').send(s(render(req)))
})
