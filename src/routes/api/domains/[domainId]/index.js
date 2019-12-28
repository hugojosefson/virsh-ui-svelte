import { omit } from 'ramda'
import wrapInErrorHandler from '../../../_wrap-in-error-handler'
import s from '../../../../fn/s'

export const render = ({ protocol, headers: { host }, domain }) => ({
  jsonapi: {
    version: '1.0'
  },
  data: renderData({ domain }),
  links: renderLinks({ protocol, headers: { host }, domain })
})

export const renderData = ({ domain }) => ({
  type: 'domain',
  id: domain.id,
  attributes: omit(['id'], domain)
})

const selfLink = ({ protocol, headers: { host }, domain: { id } }) =>
  `${protocol}://${host}/api/domains/${id}`

const mayStart = ({ state }) =>
  !['running', 'started'].includes(state.toLowerCase())

const mayShutdown = ({ state }) =>
  !['shutdown', 'shut off', 'stopped'].includes(state.toLowerCase())

export const renderLinks = ({ protocol, headers, domain }) => ({
  self: selfLink({ protocol, domain, headers }),
  start: mayStart(domain)
    ? `${selfLink({ protocol, domain, headers })}/start`
    : undefined,
  shutdown: mayShutdown(domain)
    ? `${selfLink({ protocol, domain, headers })}/shutdown`
    : undefined
})

export const get = wrapInErrorHandler((req, res, next) => {
  res.type('application/vnd.api+json').send(s(render(req)))
})
