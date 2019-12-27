import { start } from '../../../../server/virsh'

export const post = (req, res, next) => {
  start(req.domain.id).then(
    message => res.status(202).send({ data: { message } }),
    next
  )
}
