import httpError from 'http-errors'
import populateReq from './populate-req'
import { from, throwError } from 'rxjs'
import { mergeMap } from 'rxjs/operators'

export default domainObsGetter =>
  populateReq(req =>
    domainObsGetter(req).pipe(
      mergeMap(domain =>
        domain
          ? from([{ domain }])
          : throwError(httpError(404, `Domain not found.`))
      )
    )
  )
