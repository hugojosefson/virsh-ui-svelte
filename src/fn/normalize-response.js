import mapObj from 'map-obj'
import { map, omit, pipe } from 'ramda'

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

export const normalize = source => mapObj(source, mapper, { deep: true })

export const json = response => response.json()
