import { compose, lensPath, path as rPath, set } from 'ramda'
import _ from 'highland'
import justReturn from '../fn/just-return'
import id from '../fn/id'
import s from '../fn/s'
import { getEventLineStream, getDomains } from './virsh'
import property from '../fn/property'

const EVENTLINE_REGEX = /^(\d{4}-\d\d-\d\d \d\d:\d\d:\d\d\.\d\d\d[^:]+): event '([^']+)' for domain ([^:]+): (.*)/

const lineToSingleEventStream = line => {
  const matches = line.match(EVENTLINE_REGEX)
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

const mutatorFactoryFor = type => mutatorFactories[type] || justReturn(id)

const eventToMutator = event => mutatorFactoryFor(event.type)(event)

const eventReducerOverAppState = (appState, event) =>
  eventToMutator(event)(appState)

export default async () => {
  console.log(`initAppState`)
  const domains = await getDomains()
  const initialAppState = { domains }
  console.log(`initAppState: initialAppState = ${s(initialAppState)}`)

  const lineStream = getEventLineStream()
  const eventStream = lineStream.flatMap(lineToSingleEventStream)

  const dataStream = eventStream.scan(initialAppState, eventReducerOverAppState)
  const dataProperty = property(initialAppState)(
    dataStream.each.bind(dataStream)
  )

  const getPath = path => rPath(path, dataProperty())

  return {
    getPath,
  }
}
