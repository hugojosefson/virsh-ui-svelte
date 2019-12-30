import wrapInErrorHandler from '../../../_wrap-in-error-handler'
import { start } from '../../../../server/virsh'
import s from '../../../../fn/s'
import { selfLink } from '.'

export const post = wrapInErrorHandler((req, res, next) => {
  start(req.domain.id).then(
    message =>
      res
        .status(202)
        .type('application/hal+json')
        .send(
          s({
            _links: {
              self: `${selfLink(req)}/start`,
              parent: selfLink(req),
            },
            message,
          })
        ),
    next
  )
})
