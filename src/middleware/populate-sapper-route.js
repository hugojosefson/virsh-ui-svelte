const findRoute = (manifest, req) =>
  manifest.server_routes.find(route => route.pattern.test(req.url))

export default ({ manifest, routeProp = 'sapperRoute' }) => (
  req,
  res,
  next
) => {
  const foundRoute = findRoute(manifest, req)
  if (foundRoute) {
    req[routeProp] = foundRoute
  }

  next()
}
