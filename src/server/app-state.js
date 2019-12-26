import { lensPath, path, set } from 'ramda'
import justReturn from '../fn/just-return'
import id from '../fn/id'

const EVENTLINE_REGEX = /^(\d{4}-\d\d-\d\d \d\d:\d\d:\d\d\.\d\d\d[^:]+): event '([^']+)' for domain ([^:]+): (.*)/

const mutatorFactories = {
  lifecycle: ({ domain, message }) => {
    const [, state, , stateReason] = message.match(/^([^ ]+)( (.+)?)?/)
    const stateLens = lensPath(['domains', domain, 'state'])
    const stateReasonLens = lensPath(['domains', domain, 'stateReason'])
    return appState =>
      set(stateLens, state)(set(stateReasonLens, stateReason)(appState))
  },
}

const mutatorFactoryFor = type => mutatorFactories[type] || justReturn(id)

const parseEventReducer = (appState, line) => {
  const [, timestamp, type, domain, message] = line.match(EVENTLINE_REGEX)
  const mutatorFactory = mutatorFactoryFor(type)
  const event = { timestamp, type, domain, message }
  const mutator = mutatorFactory(event)

  return mutator(appState)
}

export default (initialState = {}) => {
  let data = { ...initialState }
  return {
    getData: () => data,
    reduceEvents: (...events) => {
      data = events.reduce(parseEventReducer, data)
      return data
    },
    getDomain: req => path(['domains', req.domain], data),
  }
}
