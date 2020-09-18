import httpError from 'http-errors'
import populateReq from './populate-req'
import { from, throwError } from 'rxjs'
import { mergeMap } from 'rxjs/operators'

export default networkObsGetter =>
  populateReq(req =>
    networkObsGetter(req).pipe(
      mergeMap(network =>
        network
          ? from([{ network }])
          : throwError(httpError(404, `Network not found.`))
      )
    )
  )
