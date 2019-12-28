import wrapInErrorHandler from '../../../_wrap-in-error-handler'
import { shutdown } from '../../../../server/virsh'
import s from '../../../../fn/s'

export const post = wrapInErrorHandler((req, res, next) => {
  shutdown(req.domain.id).then(
    message =>
      res
        .status(202)
        .type('application/vnd.api+json')
        .send(
          s({
            jsonapi: {
              version: '1.0',
            },
            data: {
              type: 'message',
              id: message,
            },
            links: {
              self: `${req.protocol}://${req.headers.host}/api/domains/${req.domain.id}/shutdown`,
            },
          })
        ),
    next
  )
})
