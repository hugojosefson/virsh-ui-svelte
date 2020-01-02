import populateReq from './populate-req'
import { of } from 'rxjs'

const findSapperRoute = (manifest, url) =>
  manifest.server_routes.find(route => route.pattern.test(url))

export default ({ manifest, routeProp = 'sapperRoute' }) =>
  populateReq(req => {
    const foundRoute = findSapperRoute(manifest, req.url)
    return foundRoute ? of({ [routeProp]: foundRoute }) : of({})
  })
