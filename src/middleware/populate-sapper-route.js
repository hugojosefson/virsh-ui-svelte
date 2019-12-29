export default ({ manifest, reqProp = 'sapperRoute' }) => (
  req,
  res,
  next
) => {
  req[reqProp] = manifest.server_routes.find(route =>
    route.pattern.test(req.url)
  )
  next()
}
