import { start } from '../../../../server/virsh'

export const post = (req, res, next) =>
  start(req.uuid).then(message => res.status(200).send({ data: { message } }))
