import { manifest } from '@sapper/internal/manifest-server'

const { server_routes: routes } = manifest

export const declaredRoute = req =>
  routes.find(route => route.pattern.test(req.url))

export default middleware => (req, res, next) => {
  const route = declaredRoute(req)
  if (!route) {
    return next()
  }

  middleware(req, res, next)
}
