import wrapInErrorHandler from '../../../_wrap-in-error-handler'
import s from '../../../../fn/s'
import { selfLink as networksLink } from '../_self-link'

export const render = (req, overrideNetwork) => {
  const effectiveReq = {
    ...req,
    network: overrideNetwork || req.network,
  }
  return {
    _links: renderLinks(effectiveReq),
    ...effectiveReq.network,
  }
}

export const renderLinks = req => ({
  self: selfLink(req),
  start: mayStart(req.network) ? `${selfLink(req)}/start` : undefined,
  stop: mayStop(req.network) ? `${selfLink(req)}/stop` : undefined,
})

export const selfLink = req => `${networksLink(req)}/${req.network.id}`

const mayStart = ({ state }) => !['on'].includes(state.toLowerCase())
const mayStop = ({ state }) => !['off'].includes(state.toLowerCase())

export const get = wrapInErrorHandler((req, res, next) => {
  res.type('application/hal+json').send(s(render(req)))
})
