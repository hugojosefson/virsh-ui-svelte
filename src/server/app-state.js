import { always, compose, equals, lensPath, path as rPath, set } from 'ramda'
import { BehaviorSubject, from } from 'rxjs'
import { filter, pluck, distinctUntilChanged, mergeScan } from 'rxjs/operators'
import {
  getDomains,
  getNetworks,
  getEventObservable,
  mapState,
  toLowerCase,
  mapNetworkState,
} from './virsh'

const findDomainId = (name, appState) => {
  const domain = Object.values(appState.domains).find(
    domain => domain.name === name
  )
  return domain ? domain.id : undefined
}

const findNetworkId = (name, appState) => {
  const network = Object.values(appState.networks).find(
    network => network.name === name
  )
  return network ? network.id : undefined
}

const getDomainIdFromName = async (name, appState) => {
  const domainId = findDomainId(name, appState)
  if (domainId) {
    return { domainId, appState }
  }
  const domains = await getDomains()
  const appStateWithNewDomains = { ...appState, domains }
  const newDomainId = findDomainId(name, appStateWithNewDomains)
  return { domainId: newDomainId, appState: appStateWithNewDomains }
}

const getNetworkIdFromName = async (name, appState) => {
  const networkId = findNetworkId(name, appState)
  if (networkId) {
    return { networkId, appState }
  }
  const networks = await getNetworks()
  const appStateWithNewNetworks = { ...appState, networks }
  const newNetworkId = findNetworkId(name, appStateWithNewNetworks)
  return { networkId: newNetworkId, appState: appStateWithNewNetworks }
}

const appStateMapperFactories = {
  lifecycle: event => async appState => {
    const { name, message, domainOrNetwork } = event
    const [, state, , stateReason] = message.match(/^([^ ]+)( (.+)?)?/)
    if (domainOrNetwork === 'domain') {
      const { domainId, appState: newAppState } = await getDomainIdFromName(
        name,
        appState
      )
      return compose(
        set(
          lensPath(['domains', domainId, 'state']),
          mapState(toLowerCase(state))
        ),
        set(
          lensPath(['domains', domainId, 'stateReason']),
          toLowerCase(stateReason)
        )
      )(newAppState)
    }

    if (domainOrNetwork === 'network') {
      const { networkId, appState: newAppState } = await getNetworkIdFromName(
        name,
        appState
      )
      return compose(
        set(
          lensPath(['networks', networkId, 'state']),
          mapState(toLowerCase(state))
        )
      )(newAppState)
    }

    throw new Error(
      `Unknown domainOrNetwork: ${JSON.stringify(domainOrNetwork)}`
    )
  },
}

const appStateMapperFactoryFor = type =>
  appStateMapperFactories[type] || always(Promise.resolve.bind(Promise))

const eventToAppStateMapper = event =>
  appStateMapperFactoryFor(event.type)(event)

const initAppState = async () => {
  const domains = await getDomains()
  const networks = await getNetworks()
  const initialAppState = { domains, networks }
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
