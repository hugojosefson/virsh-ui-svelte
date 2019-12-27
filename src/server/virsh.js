import execa from 'execa'
import { spawn } from 'node-pty'
import _ from 'highland'
import { zipObj, zipWith } from 'ramda'
import s from '../fn/s'

const taplog = stdout => {
  console.log(stdout)
  return stdout
}

export const virsh = (...args) => {
  console.log(`\nExecuting virsh ${args.join(' ')}`)
  return execa('virsh', args)
    .then(
      ({ stdout }) => stdout.trim(),
      cause => {
        console.error(s(cause))
        return Promise.reject(
          // Object.assign(new Error('Could not run virsh command.'), { cause })
          new Error('Could not run virsh command.')
        )
      }
    )
    .then(taplog)
}

export const getIds = () =>
  virsh('list', '--all', '--uuid').then(stdout =>
    stdout.split('\n').filter(Boolean)
  )

export const getId = domain =>
  Promise.resolve(domain).then(d => virsh('domuuid', d))

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
  const pty = spawn('virsh', ['event', '--loop', '--timestamp', '--all'])
  return _(pty)
    .split()
    .compact()
}

export const getState = domain => virsh('domstate', domain)
export const start = domain => virsh('start', domain)
export const shutdown = domain => virsh('shutdown', domain)
