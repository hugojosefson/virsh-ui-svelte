import wrapInErrorHandler from '../../../_wrap-in-error-handler'
import s from '../../../../fn/s'

export const render = ({ protocol, headers, domain }) => ({
  _links: renderLinks({ protocol, headers, domain }),
  ...domain,
})

export const renderLinks = ({ protocol, headers, domain }) => ({
  self: selfLink({ protocol, domain, headers }),
  start: mayStart(domain)
    ? `${selfLink({ protocol, domain, headers })}/start`
    : undefined,
  shutdown: mayShutdown(domain)
    ? `${selfLink({ protocol, domain, headers })}/shutdown`
    : undefined,
})

export const selfLink = ({ protocol, headers: { host }, domain: { id } }) =>
  `${protocol}://${host}/api/domains/${id}`

const mayStart = ({ state }) =>
  !['running', 'started'].includes(state.toLowerCase())

const mayShutdown = ({ state }) =>
  !['shutdown', 'shut off', 'stopped'].includes(state.toLowerCase())

export const get = wrapInErrorHandler((req, res, next) => {
  res.type('application/hal+json').send(s(render(req)))
})
