import wrapInErrorHandler from '../../../_wrap-in-error-handler'
import { pauseDomain } from '../../../../server/virsh'
import s from '../../../../fn/s'
import { selfLink } from '.'

export const post = wrapInErrorHandler((req, res, next) => {
  pauseDomain(req.domain.id).then(
    message =>
      res
        .status(202)
        .type('application/hal+json')
        .send(
          s({
            _links: {
              self: `${selfLink(req)}/pause`,
              parent: selfLink(req),
            },
            message,
          })
        ),
    next
  )
})
