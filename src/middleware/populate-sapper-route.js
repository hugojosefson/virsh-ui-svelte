export default ({ manifest, routeProp = 'sapperRoute' }) => (
  req,
  res,
  next
) => {
  req[routeProp] = manifest.server_routes.find(route =>
    route.pattern.test(req.url)
  )
  next()
}
