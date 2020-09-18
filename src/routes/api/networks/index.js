import wrapInErrorHandler from '../../_wrap-in-error-handler'
import s from '../../../fn/s'
import { selfLink } from './_self-link'
import { render as renderNetwork } from './[networkId]'

export const render = (req, overrideNetworks) => {
  const effectiveNetworks = overrideNetworks || req.getPath(['networks'])
  return {
    _links: { self: selfLink(req) },
    _collection: Object.values(effectiveNetworks).map(network =>
      renderNetwork(req, network)
    ),
  }
}

export const get = wrapInErrorHandler((req, res, next) => {
  res.type('application/hal+json').send(s(render(req)))
})
