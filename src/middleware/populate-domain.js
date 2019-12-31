import httpError from 'http-errors'

export default getPath => (req, res, next) => {
  const domain = getPath(['domains', req.params.domainId])

  if (!domain) {
    return next(httpError(404, `Domain not found.`))
  }

  req.domain = domain
  next()
}
