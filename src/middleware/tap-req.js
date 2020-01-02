export default (req, res, next) => {
  console.log({
    method: req.method,
    url: req.url,
    params: req.params,
    domain: req.domain,
    getPath: typeof req.getPath,
    onPath: typeof req.onPath
  })
  next()
}
