export default manifest => (req, res, next) => {
  req.declaredRoute = manifest.server_routes.find(route =>
    route.pattern.test(req.url)
  )
  next()
}
