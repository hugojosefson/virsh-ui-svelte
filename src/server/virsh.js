import { zipObj, zipWith } from 'ramda'
import _ from 'highland'
import execa from 'execa'
import { spawn } from 'node-pty'
import httpError from 'http-errors'

const virshErrorMappers = [
  {
    test: cause => /domain is not running$/i.test(cause.stderr),
    mapper: cause => httpError(409, `The domain is not running.`, { cause })
  },
  {
    test: cause => /domain is already active$/i.test(cause.stderr),
    mapper: cause => httpError(409, `The domain is already active.`, { cause })
  },
  {
    // default fallback
    test: () => true,
    log: true,
    mapper: cause =>
      httpError(500, `Unknown error when running virsh command.`, { cause })
  }
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

  return zipObj(names, domainsWithNameAndState)
}

export const getEventLineStream = () => {
  const pty = spawn(
    'virsh',
    ['event', '--loop', '--timestamp', '--all'],
    undefined
  )
  return _(pty)
    .split()
    .compact()
}

export const getState = domain => virsh('domstate', domain)
export const start = domain => virsh('start', domain)
export const shutdown = domain => virsh('shutdown', domain, '--mode', 'acpi')
