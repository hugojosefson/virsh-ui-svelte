import { compose, lensPath, path as rPath, set } from 'ramda'
import justReturn from '../fn/just-return'
import id from '../fn/id'
import { getDomains, getEventLineStream } from './virsh'

const EVENTLINE_REGEX = /^(\d{4}-\d\d-\d\d \d\d:\d\d:\d\d\.\d\d\d[^:]+): event '([^']+)' for domain ([^:]+): (.*)/

const mutatorFactories = {
  lifecycle: event => {
    const { domain, message } = event
    const [, state, , stateReason] = message.match(/^([^ ]+)( (.+)?)?/)
    return compose(
      set(lensPath(['domains', domain, 'state']), state),
      set(lensPath(['domains', domain, 'stateReason']), stateReason)
    )
  },
}

const mutatorFactoryFor = type => mutatorFactories[type] || justReturn(id)

const parseEventReducer = (appState, line) => {
  const [, timestamp, type, domain, message] = line.match(EVENTLINE_REGEX)
  const event = { timestamp, type, domain, message }
  const mutatorFactory = mutatorFactoryFor(type)
  const mutator = mutatorFactory(event)

  return mutator(appState)
}

export default async () => {
  let data = { domains: await getDomains() }
  getEventLineStream().each(line => {
    data = parseEventReducer(data, line)
  })
  const getData = () => data
  const getPath = path => rPath(path, data)
  const getDomain = domain => getPath(['domains', domain])
  return {
    getData,
    getPath,
    getDomain,
  }
}
