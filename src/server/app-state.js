import { always, compose, equals, lensPath, path as rPath, set } from 'ramda'
import { BehaviorSubject, from } from 'rxjs'
import { filter, pluck, distinctUntilChanged, mergeScan } from 'rxjs/operators'
import { getDomains, getEventObservable } from './virsh'

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

const appStateMapperFactories = {
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

const appStateMapperFactoryFor = type =>
  appStateMapperFactories[type] || always(Promise.resolve.bind(Promise))

const eventToAppStateMapper = event =>
  appStateMapperFactoryFor(event.type)(event)

const initAppState = async () => {
  const domains = await getDomains()
  const initialAppState = { domains }
  const appStateSubject = new BehaviorSubject(initialAppState)

  getEventObservable()
    .pipe(
      mergeScan(
        (appState, event) => from(eventToAppStateMapper(event)(appState)),
        initialAppState
      )
    )
    .subscribe(appStateSubject)

  const onPath = path =>
    appStateSubject.pipe(
      pluck(...path),
      filter(Boolean),
      distinctUntilChanged(equals)
    )
  const getPath = path => rPath(path, appStateSubject.getValue())

  return {
    onPath,
    getPath,
  }
}

export default initAppState
