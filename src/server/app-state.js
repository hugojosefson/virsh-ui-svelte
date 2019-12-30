import { always, compose, lensPath, path as rPath, set } from 'ramda'
import _ from 'highland'
import { getDomains, getEventLineStream } from './virsh'
import streamToGetter from '../fn/stream-to-getter'

const EVENT_LINE_REGEX = /^(\d{4}-\d\d-\d\d \d\d:\d\d:\d\d\.\d\d\d[^:]+): event '([^']+)' for domain ([^:]+): (.*)/

const lineToSingleEventStream = line => {
  const matches = line.match(EVENT_LINE_REGEX)
  if (matches) {
    const [, timestamp, type, name, message] = matches
    return _.of({ timestamp, type, name, message })
  } else {
    return _([])
  }
}

const findId = (name, appState) => {
  const domain = Object.values(appState.domains).find(
    domain => domain.name === name
  )
  return domain ? domain.id : undefined
}

const getIdFromName = async (name, appState) => {
  const id = findId(name, appState)
  if (id) {
    return { id, appState }
  }
  const domains = await getDomains()
  const newAppState = { ...appState, domains }
  const newId = findId(name, newAppState)
  return { id: newId, appState: newAppState }
}

const mutatorFactories = {
  lifecycle: event => async appState => {
    const { name, message } = event
    const [, state, , stateReason] = message.match(/^([^ ]+)( (.+)?)?/)
    const { id, appState: newAppState } = await getIdFromName(name, appState)
    return compose(
      set(lensPath(['domains', id, 'state']), state),
      set(lensPath(['domains', id, 'stateReason']), stateReason)
    )(newAppState)
  },
}

const mutatorFactoryFor = type =>
  mutatorFactories[type] || always(Promise.resolve.bind(Promise))

const eventToMutator = event => mutatorFactoryFor(event.type)(event)

export default async () => {
  const domains = await getDomains()
  const initialAppState = { domains }

  const lineStream = getEventLineStream()
  const eventStream = lineStream.flatMap(lineToSingleEventStream)
  const appStateStreamStream = _()
  const appStateStream = appStateStreamStream.sequence()

  eventStream.each(event => {
    const mutator = eventToMutator(event)
    const appState = getAppState()
    const promise = mutator(appState)
    appStateStreamStream.write(_(promise))
  })

  const getAppState = streamToGetter(appStateStream.fork(), initialAppState)
  const getPath = path => rPath(path, getAppState())
  const getAppStateStream = () => appStateStream.fork()

  return {
    getAppStateStream,
    getPath,
  }
}
