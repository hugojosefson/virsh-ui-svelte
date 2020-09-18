import { zipObj, zipWith } from 'ramda'
import { spawn } from 'node-pty'
import { fromEvent, of, EMPTY } from 'rxjs'
import { concatMap, mergeAll } from 'rxjs/operators'
import execa from 'execa'
import httpError from 'http-errors'

const EVENT_LINE_REGEX = /^(\d{4}-\d\d-\d\d \d\d:\d\d:\d\d\.\d\d\d[^:]+): event '([^']+)' for ([^ ]+) ([^:]+): (.*)/

const lineToSingleEventObservable = line => {
  const matches = line.match(EVENT_LINE_REGEX)
  console.log(`Event: ${JSON.stringify({ line, matches })}`)
  if (matches) {
    const [, timestamp, type, domainOrNetwork, name, message] = matches
    return of({ timestamp, type, domainOrNetwork, name, message })
  } else {
    return EMPTY
  }
}

const virshErrorMappers = [
  {
    test: cause => /domain is not running$/i.test(cause.stderr),
    mapper: cause => httpError(409, `The domain is not running.`, { cause }),
  },
  {
    test: cause => /domain is already active$/i.test(cause.stderr),
    mapper: cause => httpError(409, `The domain is already active.`, { cause }),
  },
  {
    // default fallback
    test: () => true,
    log: true,
    mapper: cause =>
      httpError(500, `Unknown error when running virsh command.`, { cause }),
  },
]

export const virsh = async (...args) => {
  try {
    const result = await execa('virsh', args)
    return result.stdout.trim()
  } catch (cause) {
    const { mapper, log = false } = virshErrorMappers.find(({ test }) =>
      test(cause)
    )
    const error = mapper(cause)
    log && console.error('server/virsh: error', error)
    throw error
  }
}

export const getDomainIds = () =>
  virsh('list', '--all', '--uuid')
    .then(stdout => stdout.split('\n'))
    .then(lines => lines.filter(Boolean))

export const getNetworkIds = () =>
  virsh('net-list', '--all', '--uuid')
    .then(stdout => stdout.split('\n'))
    .then(lines => lines.filter(Boolean))

export const getDomainName = domain =>
  Promise.resolve(domain).then(d => virsh('domname', d))

export const getNetworkName = network =>
  Promise.resolve(network).then(d => virsh('net-name', d))

export const getDomains = async (ids = getDomainIds()) => {
  const _ids = await Promise.resolve(ids)
  const states = await Promise.all(_ids.map(getDomainState))
  const names = await Promise.all(_ids.map(getDomainName))

  const domainsWithName = zipWith((id, name) => ({ id, name }), _ids, names)
  const domainsWithNameAndState = zipWith(
    (domain, state) => ({ ...domain, state }),
    domainsWithName,
    states
  )

  return zipObj(_ids, domainsWithNameAndState)
}

export const getNetworks = async (ids = getNetworkIds()) => {
  const _ids = await Promise.resolve(ids)
  const states = await Promise.all(_ids.map(getNetworkState))
  const names = await Promise.all(_ids.map(getNetworkName))

  const networksWithName = zipWith((id, name) => ({ id, name }), _ids, names)
  const networksWithNameAndState = zipWith(
    (network, state) => ({ ...network, state }),
    networksWithName,
    states
  )

  return zipObj(_ids, networksWithNameAndState)
}

export const getDomainEventLineObservable = () => {
  const ptyProcess = spawn(
    'virsh',
    ['event', '--loop', '--timestamp', '--all'],
    {}
  )
  return fromEvent(ptyProcess, 'data')
}

export const getNetworkEventLineObservable = () => {
  const ptyProcess = spawn(
    'virsh',
    ['net-event', '--loop', '--timestamp', '--event', 'lifecycle'],
    {}
  )
  return fromEvent(ptyProcess, 'data')
}

export const getEventObservable = () =>
  of(getDomainEventLineObservable(), getNetworkEventLineObservable())
    .pipe(mergeAll())
    .pipe(concatMap(lineToSingleEventObservable))

export const toLowerCase = s =>
  typeof s === 'undefined' ? '' : `${s}`.toLowerCase()

export const mapState = state =>
  ({
    'shut off': 'off',
    shutdown: 'off',
    stopped: 'off',
    running: 'on',
    resumed: 'on',
    started: 'on',
    yes: 'on',
    no: 'off',
    destroyed: 'off',
  }[state] || state)

const last = xs => xs[xs.length - 1]

export const mapNetworkState = info => {
  const lines = info.split('\n')
  const activeLine = lines.find(line => line.startsWith('active:')) || ''
  const activeLineTokens = activeLine.split(/\s/g)
  const active = last(activeLineTokens)
  return mapState(active)
}

export const getDomainState = domain =>
  virsh('domstate', domain).then(toLowerCase).then(mapState)

export const getNetworkState = network =>
  virsh('net-info', network).then(toLowerCase).then(mapNetworkState)

export const startDomain = domain => virsh('start', domain)
export const shutdownDomain = domain =>
  virsh('shutdown', domain, '--mode', 'agent,acpi')

export const startNetwork = network => virsh('net-start', network)
export const shutdownNetwork = network => virsh('net-destroy', network)
