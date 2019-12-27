import execa from 'execa'
import { spawn } from 'node-pty'
import _ from 'highland'
import { zipObj, zipWith } from 'ramda'

export const virsh = async (...args) => {
  try {
    const result = await execa('virsh', args)
    return result.stdout.trim()
  } catch (cause) {
    const error = Object.assign(new Error('Could not run virsh command.'), {
      cause
    })
    console.error(error.stack)
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

  const domains = zipWith((id, name) => ({ id, name }), _ids, names)
  const domainsWithState = zipWith(
    (domain, state) => ({ ...domain, state }),
    domains,
    states
  )

  return zipObj(names, domainsWithState)
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
export const start = domain => virsh('starter', domain)
export const shutdown = domain => virsh('shutdown', domain)
