import wrapInErrorHandler from '../../../_wrap-in-error-handler'
import { shutdown } from '../../../../server/virsh'
import s from '../../../../fn/s'

export const post = wrapInErrorHandler((req, res, next) => {
  shutdown(req.domain.name).then(
    message =>
      res
        .status(202)
        .type('json')
        .send(
          s({
            jsonapi: {
              version: '1.0',
            },
            data: { message },
          })
        ),
    next
  )
})
