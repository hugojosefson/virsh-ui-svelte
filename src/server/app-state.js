import { always, compose, lensPath, path as rPath, set } from 'ramda'
import _ from 'highland'
import id from '../fn/id'
import { getEventLineStream, getDomains } from './virsh'
import streamToGetter from '../fn/stream-to-getter'

const EVENT_LINE_REGEX = /^(\d{4}-\d\d-\d\d \d\d:\d\d:\d\d\.\d\d\d[^:]+): event '([^']+)' for domain ([^:]+): (.*)/

const lineToSingleEventStream = line => {
  const matches = line.match(EVENT_LINE_REGEX)
  if (matches) {
    const [, timestamp, type, domain, message] = matches
    return _.of({ timestamp, type, domain, message })
  } else {
    return _([])
  }
}

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

const mutatorFactoryFor = type => mutatorFactories[type] || always(id)

const eventToMutator = event => mutatorFactoryFor(event.type)(event)

const eventReducerOverAppState = (appState, event) =>
  eventToMutator(event)(appState)

export default async () => {
  const domains = await getDomains()
  const initialAppState = { domains }

  const lineStream = getEventLineStream()
  const eventStream = lineStream.flatMap(lineToSingleEventStream)

  const dataStream = eventStream.scan(initialAppState, eventReducerOverAppState)
  const getData = streamToGetter(dataStream, initialAppState)

  const getPath = path => rPath(path, getData())

  return {
    getPath,
  }
}
