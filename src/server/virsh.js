import { zipObj, zipWith } from 'ramda'
import { spawn } from 'node-pty'
import { fromEvent, of, EMPTY } from 'rxjs'
import { concatMap } from 'rxjs/operators'
import execa from 'execa'
import httpError from 'http-errors'

const EVENT_LINE_REGEX = /^(\d{4}-\d\d-\d\d \d\d:\d\d:\d\d\.\d\d\d[^:]+): event '([^']+)' for domain ([^:]+): (.*)/

const lineToSingleEventObservable = line => {
  const matches = line.match(EVENT_LINE_REGEX)
  if (matches) {
    const [, timestamp, type, name, message] = matches
    return of({ timestamp, type, name, message })
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
    log && console.error(error)
    throw error
  }
}

export const getIds = () =>
  virsh('list', '--all', '--uuid')
    .then(stdout => stdout.split('\n'))
    .then(lines => lines.filter(Boolean))

export const getName = domain =>
  Promise.resolve(domain).then(d => virsh('domname', d))

export const getDomains = async (ids = getIds()) => {
  const _ids = await Promise.resolve(ids)
  const states = await Promise.all(_ids.map(getState))
  const names = await Promise.all(_ids.map(getName))

  const domainsWithName = zipWith((id, name) => ({ id, name }), _ids, names)
  const domainsWithNameAndState = zipWith(
    (domain, state) => ({ ...domain, state }),
    domainsWithName,
    states
  )

  return zipObj(_ids, domainsWithNameAndState)
}

export const getEventLineObservable = () => {
  const ptyProcess = spawn('virsh', ['event', '--loop', '--timestamp', '--all'])
  return fromEvent(ptyProcess, 'data')
}

export const getEventObservable = () =>
  getEventLineObservable().pipe(concatMap(lineToSingleEventObservable))

export const getState = domain => virsh('domstate', domain)
export const start = domain => virsh('start', domain)
export const shutdown = domain => virsh('shutdown', domain, '--mode', 'acpi')
