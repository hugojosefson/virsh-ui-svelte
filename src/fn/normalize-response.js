import { complement as not, equals, map, omit, pipe } from 'ramda'
import mapObj from 'map-obj'

import o2a from './o2a'

const normalizeLink = link => (typeof link === 'string' ? { href: link } : link)

const normalizeLinks = (key, value) => {
  if (key !== '_links') {
    return [key, value]
  }

  const links = value
  const newValue = map(normalizeLink, links)
  return [key, newValue]
}

const mapper = pipe(normalizeLinks)

export const arrayifyCollection = source => {
  if (!source._collection) {
    return source
  }

  const target = [...source._collection]
  const otherProps = omit(['_collection'], source)
  return Object.assign(target, otherProps)
}

export const json = response => response.json()

export const normalize = (fetchFn = fetch) => async source => {
  const links = _links =>
    o2a('rel', '...')(_links).filter(({ rel }) => rel !== 'self')

  const allowedMethods = href =>
    fetchFn(href, { method: 'OPTIONS' }).then(response =>
      (response.headers.get('Allow') || '').split(',')
    )

  const getActions = async link =>
    (await allowedMethods(link.href))
      .filter(not(equals('OPTIONS')))
      .map(method => ({ ...link, method }))

  const getActionableLinks = data =>
    Promise.all(
      links(data._links).map(async link => ({
        ...link,
        actions: await getActions(link),
      }))
    )

  const data = mapObj(source, mapper, { deep: true })
  const _actionableLinks = await getActionableLinks(data)

  return { ...data, _links: _actionableLinks }
}
