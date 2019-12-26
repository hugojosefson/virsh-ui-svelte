import execa from 'execa'
import { zipWith, zipObj } from 'ramda'
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

export const getUuids = () =>
  virsh('list', '--all', '--uuid').then(stdout =>
    stdout.split('\n').filter(Boolean)
  )

export const getUuid = domain =>
  Promise.resolve(domain).then(d => virsh('domuuid', d))

export const getName = domain =>
  Promise.resolve(domain).then(d => virsh('domname', d))

export const getDomains = async (uuids = getUuids()) => {
  const _uuids = await Promise.resolve(uuids)
  const states = await Promise.all(_uuids.map(getState))
  const names = await Promise.all(_uuids.map(getName))
  return zipObj(
    names,
    zipWith((uuid, state) => ({ uuid, state }), _uuids, states)
  )
}

export const getState = domain => virsh('domstate', domain)
export const start = domain => virsh('start', domain)
export const shutdown = domain => virsh('shutdown', domain)
